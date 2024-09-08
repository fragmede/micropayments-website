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
