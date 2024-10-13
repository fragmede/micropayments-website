import React, { useCallback, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

import Step from './Step';

const RPC_URL = 'https://rpc-proxy.lingering-sea-b5fd.workers.dev/';

const ChargeButton = ({...props}) => {
  const { publicKey, sendTransaction } = useWallet();
  const connection = new Connection(RPC_URL);
  const [status, setStatus] = useState('');

  const chargeUser = useCallback(async () => {
    if (!publicKey) {
      setStatus('Error: Wallet not connected');
      return;
    }

    const CRYPTO_TEST = 'GXmQ9JRpefccTssu3yhMmRVmXSJ7JEQa78pp9xQnsM78';
    const lamports = 400000; // 0.004 SOL = 40000000 lamports ~= $.10 USD 2024.07.03

    const recipient = new PublicKey(CRYPTO_TEST);
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: recipient,
        lamports,
      })
    );

    try {
      setStatus('Processing transaction...');
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      setStatus('Transaction successful! Signature: ' + signature);
    } catch (error) {
      setStatus('Transaction failed: ' + error.message);
    }
  }, [publicKey, sendTransaction, connection]);

  return (
    <Step title="Make Your Micropayment" {...props}>
      <p>You're all set! Click the button below to make a $0.10 USD micropayment.</p>
      <button 
        onClick={chargeUser} 
        disabled={!publicKey}
        className="charge-button"
      >
        Pay $0.10
      </button>
      {status && <p className="transaction-status">{status}</p>}
    </Step>
  );
};

export default ChargeButton;
