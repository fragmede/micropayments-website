import React from 'react';
import Step from './Step';

const InstallPhantom = ({...props}) => {
  return (
    <Step title="Install Phantom Wallet" {...props}>
      <p>Phantom is a popular and user-friendly wallet for the Solana blockchain. Follow these steps to install and set up your Phantom wallet:</p>
      <ol>
        <li>Visit the <a href="https://phantom.app/download" target="_blank" rel="noopener noreferrer">Phantom wallet download page</a>.</li>
        <li>Choose the correct version for your browser (Chrome, Firefox, Brave, or Edge).</li>
        <li>Click "Add to Browser" to install the extension.</li>
        <li>Once installed, click on the Phantom icon in your browser's extension area.</li>
        <li>Click "Create New Wallet".</li>
        <li>Write down your secret recovery phrase in a safe place. This is crucial for recovering your wallet if needed.</li>
        <li>Verify your secret recovery phrase.</li>
        <li>Create a password for your wallet.</li>
      </ol>
      <p>Important: Never share your secret recovery phrase or password with anyone. Phantom will never ask for this information.</p>
      <p>After setting up your Phantom wallet, you're ready to transfer your SOL from Coinbase in the next step!</p>
    </Step>
  );
};

export default InstallPhantom;
