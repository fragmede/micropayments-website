import React, { useCallback, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

const RPC_URL = 'https://rpc-proxy.lingering-sea-b5fd.workers.dev/';

const ChargeButton = () => {
  const { publicKey, sendTransaction } = useWallet();
  const connection = new Connection(RPC_URL);

  const chargeUser = useCallback(async () => {
    if (!publicKey) {
      console.log('Wallet not connected');
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
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      console.log('Transaction successful:', signature);
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  }, [publicKey, sendTransaction, connection]);

  return (
    <button onClick={chargeUser} disabled={!publicKey}>
      Charge 10 cents
    </button>
  );
};

export default ChargeButton;
