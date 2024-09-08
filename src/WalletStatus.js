import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

const WalletStatus = () => {
  const { connected, publicKey } = useWallet();
  const [status, setStatus] = useState('Disconnected');

  useEffect(() => {
    if (connected) {
      setStatus(`Connected: ${publicKey.toString()}`);
    } else {
      setStatus('Disconnected');
    }
  }, [connected, publicKey]);

  return <div>{status}</div>;
};

export default WalletStatus;
