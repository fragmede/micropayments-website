#!/usr/bin/env bash
set -Eeuo pipefail
commit=${1:?Missing commit}
release=${2:?Missing release}
[[ "$commit" =~ ^[a-f0-9]{40}$ && "$release" =~ ^[0-9]{8}T[0-9]{6}Z-[a-f0-9]{12}$ ]]
repo=/home/fragmede/projects/micropayments-website
candidate="$repo/releases/$release"
backup="$repo/deploy-backups/$release"
vhost=/etc/apache2/sites-available/micropayments.fyi-le-ssl.conf
api_config=/etc/apache2/micropayments-api.conf
unit=/etc/systemd/system/micropayments-node.service
webroot=/var/www/micropayments.fyi
check_unit="micropayments-check-$release"
exec 9>"$repo/.deploy.lock"
flock -n 9

git -C "$repo" diff --exit-code HEAD
GIT_TERMINAL_PROMPT=0 git -C "$repo" -c credential.helper= fetch \
  https://github.com/fragmede/micropayments-website.git main:refs/remotes/origin/main
git -C "$repo" merge --ff-only "$commit"
test "$(git -C "$repo" rev-parse HEAD)" = "$commit"
test -L "$webroot"
test -s "$candidate/server-dist/index.mjs"
test -s "$candidate/server-dist/payment.env"
test -s "$candidate/dist/index.html"

# Exercise the release using the production Node runtime before changing traffic.
cleanup_check() { sudo -n systemctl stop "$check_unit" >/dev/null 2>&1 || true; }
trap cleanup_check EXIT
sudo -n systemd-run --quiet --collect --unit="$check_unit" --uid=www-data --gid=www-data \
  --property="EnvironmentFile=$candidate/server-dist/payment.env" \
  --setenv=PUBLIC_ORIGIN=https://micropayments.fyi --setenv=PORT=8790 \
  /usr/bin/node "$candidate/server-dist/index.mjs"
for attempt in $(seq 1 20); do
  if curl -fsS http://127.0.0.1:8790/api/x402/status >/dev/null 2>&1; then break; fi
  sleep 1
done
node "$candidate/scripts/verify-payment.mjs" http://127.0.0.1:8790 https://micropayments.fyi --api-only
sudo -n systemctl is-active --quiet "$check_unit"
cleanup_check

mkdir -p "$backup"
sudo -n cp -p "$vhost" "$backup/vhost.conf"
sudo -n cp -p "$unit" "$backup/service.conf"
if [[ -f "$api_config" ]]; then sudo -n cp -p "$api_config" "$backup/api.conf"; fi
previous_current=$(readlink "$repo/current" || true)
previous_webroot=$(readlink "$webroot")
was_active=$(systemctl is-active micropayments-node.service || true)
was_enabled=$(systemctl is-enabled micropayments-node.service || true)
printf '%s\n' "$previous_current" > "$backup/previous-current"
printf '%s\n' "$previous_webroot" > "$backup/previous-webroot"

replace_link() {
  ln -sfnT "$1" "$repo/.current-$release"
  mv -Tf "$repo/.current-$release" "$repo/current"
}
replace_webroot() {
  sudo -n ln -sfnT "$1" "/var/www/.micropayments-$release"
  sudo -n mv -Tf "/var/www/.micropayments-$release" "$webroot"
}
rollback() {
  trap - ERR HUP INT TERM
  set +e
  echo "Activation failed; restoring the previous site. Backups: $backup" >&2
  sudo -n cp -p "$backup/vhost.conf" "$vhost"
  sudo -n cp -p "$backup/service.conf" "$unit"
  if [[ -f "$backup/api.conf" ]]; then sudo -n cp -p "$backup/api.conf" "$api_config"; else sudo -n rm -f "$api_config"; fi
  if [[ -n "$previous_current" ]]; then replace_link "$previous_current"; else rm -f "$repo/current"; fi
  replace_webroot "$previous_webroot"
  sudo -n systemctl daemon-reload
  if [[ "$was_enabled" != enabled ]]; then sudo -n systemctl disable micropayments-node.service; fi
  if [[ "$was_active" == active ]]; then sudo -n systemctl restart micropayments-node.service; else sudo -n systemctl stop micropayments-node.service; fi
  sudo -n apache2ctl configtest && sudo -n systemctl reload apache2
  exit 1
}
trap rollback ERR HUP INT TERM

sudo -n install -m 644 "$candidate/deploy/micropayments-node.service" "$unit"
sudo -n install -m 644 "$candidate/deploy/apache-api.conf" "$api_config"
if ! grep -qF "IncludeOptional $api_config" "$vhost"; then
  sudo -n sed -i "\|</VirtualHost>|i IncludeOptional $api_config" "$vhost"
fi
sudo -n apache2ctl configtest
replace_link "$candidate"
replace_webroot "$repo/current/dist"
sudo -n systemctl daemon-reload
sudo -n systemctl enable micropayments-node.service
sudo -n systemctl restart micropayments-node.service
for attempt in $(seq 1 20); do
  if curl -fsS http://127.0.0.1:8789/api/x402/status >/dev/null 2>&1; then break; fi
  sleep 1
done
node "$candidate/scripts/verify-payment.mjs" http://127.0.0.1:8789 https://micropayments.fyi --api-only
sudo -n systemctl reload apache2
node "$candidate/scripts/verify-payment.mjs" https://micropayments.fyi
trap - ERR HUP INT TERM
echo "Activated $release. Previous site and configuration retained in $backup"
