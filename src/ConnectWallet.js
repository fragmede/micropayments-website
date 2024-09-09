import {
  WalletModalProvider,
  WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import React from 'react';
import Step from './Step';

const ConnectWallet = ({...props}) => {
    return (
        <Step title="connect wallet" {...props}>
            <p>Now, click this connect wallet button.</p>
            <p>This will connect this webpage to your wallet.</p>
            <WalletMultiButton />
        </Step>
    );
};

export default ConnectWallet;
