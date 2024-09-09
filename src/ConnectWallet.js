import {
  WalletModalProvider,
  WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import React from 'react';
import Step from './Step';

const ConnectWallet = ({...props}) => {
    return (
        <Step title="connect wallet" {...props}>
            <p>go make a coinbase account.</p>
            <p>Account creation functionality will be implemented here.</p>
            <WalletMultiButton />
        </Step>
    );
};

export default ConnectWallet;
