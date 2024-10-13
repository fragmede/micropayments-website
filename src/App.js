import React, { useMemo, useState, useCallback } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import {
  PhantomWalletAdapter
} from '@solana/wallet-adapter-wallets';
import {
  WalletModalProvider,
} from '@solana/wallet-adapter-react-ui';
import WalletStatus from './WalletStatus';
import IntroBlurb from './IntroBlurb';
import CreateAccount from './CreateAccount';
import ConnectWallet from './ConnectWallet';
import FundIt from './FundIt';
import GetSol from './GetSol';
import InstallPhantom from './InstallPhantom';
import TransferToPhantom from './TransferToPhantom';
import ChargeButton from './ChargeButton';
import DoneMessage from './DoneMessage';

const RPC_URL = 'https://rpc-proxy.lingering-sea-b5fd.workers.dev/';

const App = () => {
  const endpoint = useMemo(() => RPC_URL, []);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  const [activeStep, setActiveStep] = useState(-1);

  const handleNext = useCallback(() => {
    setActiveStep(prevStep => prevStep + 1);
  }, []);

  const handlePrev = useCallback(() => {
    setActiveStep(prevStep => Math.max(prevStep - 1, 0));
  }, []);

  const onSelFunc = useCallback((idx) => () => setActiveStep(idx), []);

  const steps = [
    { component: CreateAccount, title: "Create Account" },
    { component: FundIt, title: "Fund Account" },
    { component: GetSol, title: "Get SOL" },
    { component: InstallPhantom, title: "Install Phantom" },
    { component: TransferToPhantom, title: "Transfer to Phantom" },
    { component: ConnectWallet, title: "Connect Wallet" },
    { component: WalletStatus, title: "Wallet Status" },
    { component: ChargeButton, title: "Make Payment" },
    { component: DoneMessage, title: "Complete" },
  ];

  const progress = ((activeStep + 1) / steps.length) * 100;

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="app-container">
            <header>
              <h1>Micropayments.fyi</h1>
            </header>
            <IntroBlurb />
            <div className="progress-bar">
              <div className="progress" style={{ width: `${progress}%` }}></div>
            </div>
            <ol className="steps-list">
              {steps.map((step, index) => {
                const StepComponent = step.component;
                return (
                  <li key={index}>
                    <StepComponent
                      onNext={handleNext}
                      onPrev={handlePrev}
                      onSel={onSelFunc(index)}
                      visible={activeStep === index}
                      isLast={index === steps.length - 1}
                    />
                  </li>
                );
              })}
            </ol>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
