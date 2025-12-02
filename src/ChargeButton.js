import React, { useCallback, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

import Step from './Step';

const RPC_URL = 'https://rpc-proxy.lingering-sea-b5fd.workers.dev/';

const ChargeButton = ({...props}) => {
  const { publicKey, sendTransaction } = useWallet();
  const connection = new Connection(RPC_URL);
  const [status, setStatus] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const chargeUser = useCallback(async () => {
    if (!publicKey) {
      setStatus('Error: Wallet not connected');
      return;
    }

    const CRYPTO_TEST = 'GXmQ9JRpefccTssu3yhMmRVmXSJ7JEQa78pp9xQnsM78';
    const lamports = 800000; // 0.0008 SOL = 800000 lamports ~= $.10 USD; 1 SOL is ~$125 USD 2025.12.01

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
      setShowPopup(true);
    } catch (error) {
      setStatus('Transaction failed: ' + error.message);
    }
  }, [publicKey, sendTransaction, connection]);

  const closePopup = () => {
    setShowPopup(false);
  };

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
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>🎉 Payment Successful! 🎉</h2>
            <p>Thank you for your micropayment of $0.10 USD!</p>
            <p>Your support helps us continue to provide valuable content and services.</p>
            <button onClick={closePopup}>Close</button>
          </div>
        </div>
      )}
    </Step>
  );
};

export default ChargeButton;
