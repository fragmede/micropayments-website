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

  return <Step title="wallet conencted" {...props}>
            <p>This should now say some gibberish that represents your wallet as having been connected:</p>
            <div>{status}</div>
        </Step>;
};

export default WalletStatus;
