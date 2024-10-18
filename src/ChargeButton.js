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
    const lamports = 650000; // 0.0006 SOL = 650000 lamports ~= $.10 USD; 1 SOL is $153.64 USD 2024.10.18

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
      <p>You're all set! Click the button below to make a $0.10 USD micropayment donation to me, say for making this website.</p>
      <p>Offer void where prohibited, all sales final, no warranty expressed or implied.</p>
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
