import {
  WalletModalProvider,
  WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import React from 'react';
import Step from './Step';

const ConnectWallet = ({...props}) => {
    return (
        <Step title="Connect Your Wallet" {...props}>
            <p>Now that you have SOL in your Phantom wallet, it's time to connect it to our dApp. This step allows the application to interact with your wallet for the micropayment.</p>
            <p>Here's what you need to do:</p>
            <ol>
                <li>Make sure your Phantom wallet extension is unlocked.</li>
                <li>Click the "Connect Wallet" button below.</li>
                <li>A popup from Phantom will appear asking for connection permission.</li>
                <li>Review the permissions and click "Connect" in the Phantom popup.</li>
            </ol>
            <p>Once connected, you'll be able to make micropayments directly from this webpage.</p>
            <p>Click the button below to connect your wallet:</p>
            <WalletMultiButton />
            <p>After connecting successfully, you'll see your wallet address displayed, indicating that you're ready for the next step.</p>
        </Step>
    );
};

export default ConnectWallet;
