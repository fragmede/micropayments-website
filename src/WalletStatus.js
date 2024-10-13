import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

import Step from './Step';

const WalletStatus = ({...props}) => {
  const { connected, publicKey } = useWallet();
  const [status, setStatus] = useState('Disconnected');

  useEffect(() => {
    if (connected) {
      setStatus(`Connected: ${publicKey.toString()}`);
    } else {
      setStatus('Disconnected');
    }
  }, [connected, publicKey]);

  return (
    <Step title="Wallet Connection Status" {...props}>
      <p>Great job! If you've followed the previous steps correctly, you should now see your wallet status below:</p>
      <div className="wallet-status">{status}</div>
      {connected ? (
        <div>
          <p>Congratulations! Your wallet is successfully connected. Here's what this means:</p>
          <ul>
            <li>The long string of characters you see is your public wallet address.</li>
            <li>This address is safe to share and is how others can send you SOL or other Solana-based tokens.</li>
            <li>Your wallet is now ready to interact with our dApp for making micropayments.</li>
          </ul>
          <p>You're all set to proceed to the final step: making your first micropayment!</p>
        </div>
      ) : (
        <div>
          <p>It looks like your wallet isn't connected yet. Here are some troubleshooting steps:</p>
          <ol>
            <li>Make sure your Phantom wallet extension is unlocked.</li>
            <li>Try refreshing the page and connecting again.</li>
            <li>If issues persist, try disconnecting and reconnecting your wallet.</li>
          </ol>
        </div>
      )}
    </Step>
  );
};

export default WalletStatus;
