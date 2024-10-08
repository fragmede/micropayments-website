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
import IntroBlurb from './IntroBlurb';
import CreateAccount from './CreateAccount';
import ConnectWallet from './ConnectWallet';
import FundIt from './FundIt';
import GetSol from './GetSol';
import InstallPhantom from './InstallPhantom';
import TransferToPhantom from './TransferToPhantom';
import ChargeButton from './ChargeButton';
import DoneMessage from './DoneMessage';


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

  const [activeStep, setActiveStep] = useState(-1);
  console.log("Current activeStep:", activeStep);

  const handleNext = useCallback((event) => {
        setActiveStep(activeStep => activeStep + 1);
  }, []);

  const handlePrev = useCallback((event) => {
  console.log("wtf2:", activeStep);
    if (activeStep < 0) {
  console.log("wtf:", activeStep);
        setActiveStep(activeStep => 0);
        }
    else{
        setActiveStep(activeStep => activeStep - 1);
  console.log("wtf3:", activeStep);
        }
  }, []);

  const onSelFunc = function (idx) {
    return () => {
        return onSel(idx);
    };
  }

  const onSel = useCallback((idx) => {
      setActiveStep(activeStep => idx);
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
            <li> <CreateAccount     onNext={handleNext} onPrev={handlePrev} onSel={onSelFunc(0)} visible={activeStep === 0} /></li>
            <li> <FundIt            onNext={handleNext} onPrev={handlePrev} onSel={onSelFunc(1)} visible={activeStep === 1} /> </li>
            <li> <GetSol            onNext={handleNext} onPrev={handlePrev} onSel={onSelFunc(2)} visible={activeStep === 2} /> </li>
            <li> <InstallPhantom    onNext={handleNext} onPrev={handlePrev} onSel={onSelFunc(3)} visible={activeStep === 3} /> </li>
            <li> <TransferToPhantom onNext={handleNext} onPrev={handlePrev} onSel={onSelFunc(4)} visible={activeStep === 4} /> </li>
            <li> <ConnectWallet     onNext={handleNext} onPrev={handlePrev} onSel={onSelFunc(5)} visible={activeStep === 5} /> </li>
            <li> <WalletStatus      onNext={handleNext} onPrev={handlePrev} onSel={onSelFunc(6)} visible={activeStep === 6} /> </li>
            <li> <ChargeButton      onNext={handleNext} onPrev={handlePrev} onSel={onSelFunc(7)} visible={activeStep === 7} /> </li>
            </ol> <ul>
            <li> <DoneMessage       onNext={handleNext} onPrev={handlePrev} onSel={onSelFunc(8)} visible={activeStep === 8} /> </li>
            </ul>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
