#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Commit your changes before deploying so the production release matches a Git commit." >&2
  exit 1
fi
if [[ "$(git branch --show-current)" != main ]]; then
  echo "Production deployments must run from main." >&2
  exit 1
fi

npm test
commit=$(git rev-parse HEAD)
release="$(date -u +%Y%m%dT%H%M%SZ)-${commit:0:12}"
repo=/home/fragmede/projects/micropayments-website
remote_release="$repo/releases/$release"
staging=$(mktemp -d /tmp/micropayments-deploy.XXXXXX)
ssh_options=(-o BatchMode=yes -o ConnectTimeout=15 -o PermitLocalCommand=no
  -o ControlMaster=auto -o ControlPersist=300 -o "ControlPath=$staging/ssh-%C")
if [[ -n "${DEPLOY_SSH_IDENTITY:-}" ]]; then
  ssh_options+=(-o IdentityAgent=none -o IdentitiesOnly=yes -o IgnoreUnknown=UseKeychain
    -o UseKeychain=yes -i "$DEPLOY_SSH_IDENTITY")
fi
cleanup() {
  ssh "${ssh_options[@]}" -O exit do >/dev/null 2>&1 || true
  rm -rf "$staging"
}
trap cleanup EXIT

# Preserve the server checkout's unrelated untracked deploy.txt and old build.
ssh "${ssh_options[@]}" do "git -C '$repo' diff --exit-code HEAD && test -L /var/www/micropayments.fyi"
git push origin HEAD:main

COPYFILE_DISABLE=1 tar --no-xattrs -czf "$staging/release.tar.gz" dist server-dist deploy scripts/activate-release.sh scripts/verify-payment.mjs
ssh "${ssh_options[@]}" do "mkdir -p '$remote_release'"
scp "${ssh_options[@]}" "$staging/release.tar.gz" "do:$remote_release/release.tar.gz"
ssh "${ssh_options[@]}" do "tar -xzf '$remote_release/release.tar.gz' -C '$remote_release' && rm '$remote_release/release.tar.gz' && bash '$remote_release/scripts/activate-release.sh' '$commit' '$release'"
node scripts/verify-payment.mjs https://micropayments.fyi
echo "Deployed $commit to https://micropayments.fyi via ssh do"
