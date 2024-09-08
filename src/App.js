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
import ToggleStep from './ToggleStep';
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
            <li><ToggleStep title="Create Account" visible={activeStep === 0} onNext={handleNext}>
              <CreateAccount onNext={handleNext} />
            </ToggleStep>
            </li>
            <li><ToggleStep title="Fund It" visible={activeStep === 1} onNext={handleNext}>
              <FundIt onNext={handleNext} />
            </ToggleStep>
            </li>
            <li><ToggleStep title="Get Sol" visible={activeStep === 2} onNext={handleNext}>
              <GetSol onNext={handleNext} />
            </ToggleStep>
            </li>
            <li><ToggleStep title="Install Phantom" visible={activeStep === 3} onNext={handleNext}>
              <InstallPhantom onNext={handleNext} />
            </ToggleStep>
            </li>
            <li><ToggleStep title="Transfer To Phantom" visible={activeStep === 4} onNext={handleNext}>
              <TransferToPhantom onNext={handleNext} />
            </ToggleStep>
            </li>
            <li><ToggleStep title="Connect Wallet" visible={activeStep === 5}>
            <WalletMultiButton />
            </ToggleStep>
            </li>
            <li><ToggleStep title="Wallet Connected" visible={activeStep === 6}>
            <WalletStatus />
            </ToggleStep>
            </li>
            <li><ToggleStep title="Charge 10 cents." visible={activeStep === 7}>
            <ChargeButton />
            </ToggleStep>
            </li>
            </ol>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
