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
import WalletStatus from './WalletStatus';
import ChargeButton from './ChargeButton';
import IntroBlurb from './IntroBlurb';
import CreateAccount from './CreateAccount';
import FundIt from './FundIt';
import GetSol from './GetSol';
import InstallPhantom from './InstallPhantom';
import TransferToPhantom from './TransferToPhantom';


const config = {
    encoding: "jsonParsed",
    transactionDetails: "full",
    rewards: false,
    maxSupportedTransactionVersion: 0,
}

const RPC_URL = 'https://rpc-proxy.lingering-sea-b5fd.workers.dev/'
//'https://api.mainnet-beta.solana.com'


const App = () => {
  const endpoint = useMemo(() => RPC_URL, []);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  const [activeStep, setActiveStep] = useState(0);
  console.log("Current activeStep:", activeStep);

  const handleNext = useCallback(() => {
    console.log("handleNext called");
    setActiveStep((prevStep) => {
      const nextStep = prevStep + 1;
      console.log("Next activeStep:", nextStep);
      return nextStep;
    });
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div style={{ padding: '20px', textAlign: 'center', fontFamily: '"Courier New", Courier, monospace' }}>
            <h1>Micropayments.fyi</h1>
          </div>
          <IntroBlurb />
          <ol>
            <li> <CreateAccount onNext={handleNext} visible={activeStep === 0} /></li>
            <li> <FundIt onNext={handleNext} visible={activeStep === 1} /> </li>
            <li> <GetSol onNext={handleNext} visible={activeStep === 2} /> </li>
            <li> <InstallPhantom onNext={handleNext} visible={activeStep === 3} /> </li>
            <li> <TransferToPhantom onNext={handleNext} visible={activeStep === 4} /> </li>
            <li> <WalletMultiButton onNext={handleNext} visible={activeStep === 5} /> </li>
            <li> <WalletStatus onNext={handleNext} visible={activeStep === 6} /> </li>
            <li> <ChargeButton onNext={handleNext} visible={activeStep === 7} /> </li>
            </ol>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
