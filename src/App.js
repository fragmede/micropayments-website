import React, { useMemo, useEffect, useState, useCallback } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
  useWallet
} from '@solana/wallet-adapter-react';
import {
  PhantomWalletAdapter
} from '@solana/wallet-adapter-wallets';
import {
  WalletModalProvider,
  WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import CreateAccount from './CreateAccount';
import FundIt from './FundIt';
import GetSol from './GetSol';
import InstallPhantom from './InstallPhantom';
import TransferToPhantom from './TransferToPhantom';

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

const config = {
    encoding: "jsonParsed",
    transactionDetails: "full",
    rewards: false,
    maxSupportedTransactionVersion: 0,
}

const RPC_URL = 'https://rpc-proxy.lingering-sea-b5fd.workers.dev/'
//'https://api.mainnet-beta.solana.com'

const ChargeButton = () => {
  const { publicKey, sendTransaction } = useWallet();
  const connection = new Connection(RPC_URL);

  const chargeUser = useCallback(async () => {
    if (!publicKey) {
      console.log('Wallet not connected');
      return;
    }

const CRYPTO_TEST = 'GXmQ9JRpefccTssu3yhMmRVmXSJ7JEQa78pp9xQnsM78'
const CRYPTO_PROD = '9m26tsxSTd8gXTwQnYPLZpac57FzCY2mCdiCBufRgpQ1'

    const recipient = new PublicKey(CRYPTO_TEST); // Replace with your recipient public key
    const lamports = 400000; // 0.004 SOL = 40000000 lamports ~= $.10 USD 2024.07.03

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: recipient,
        lamports,
      })
    );
	console.log('here')

    try {
      const signature = await sendTransaction(transaction, connection);
	  console.log('sent')
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

const App = () => {
  const endpoint = useMemo(() => RPC_URL, []);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Micropayments.fyi</h1>
            <CreateAccount />
            <FundIt />
            <GetSol />
            <InstallPhantom />
            <TransferToPhantom />
            <WalletMultiButton />
            <WalletStatus />
            <ChargeButton />
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
