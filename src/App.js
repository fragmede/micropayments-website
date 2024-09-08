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
import ToggleComponent from './ToggleComponent';
import IntroBlurb from './IntroBlurb';
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

  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };
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
          <div style={{ padding: '20px', textAlign: 'center', fontFamily: '"Courier New", Courier, monospace' }}>
            <h1>Micropayments.fyi</h1>
          </div>
          <IntroBlurb />
          <ol>
            <li><ToggleComponent title="Create Account" defaultVisible={activeStep === 0}>
              <CreateAccount onNext={handleNext} />
            </ToggleComponent>
            </li>
            <li><ToggleComponent title="Fund It" defaultVisible={activeStep === 1}>
              <FundIt />
            </ToggleComponent>
            </li>
            <li><ToggleComponent title="Get Sol">
              <GetSol />
            </ToggleComponent>
            </li>
            <li><ToggleComponent title="Install Phantom">
              <InstallPhantom />
            </ToggleComponent>
            </li>
            <li><ToggleComponent title="Transfer To Phantom">
              <TransferToPhantom />
            </ToggleComponent>
            </li>
            <li><ToggleComponent title="Connect Wallet">
            <WalletMultiButton />
            </ToggleComponent>
            </li>
            <li><ToggleComponent title="Wallet Connected">
            <WalletStatus />
            </ToggleComponent>
            </li>
            <li><ToggleComponent title="Charge 10 cents.">
            <ChargeButton />
            </ToggleComponent>
            </li>
            </ol>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
