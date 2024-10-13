import React from 'react';
import Step from './Step';

const TransferToPhantom = ({...props}) => {
  return (
    <Step title="Transfer SOL to Phantom" {...props}>
      <p>Now that you have SOL in your Coinbase account and a Phantom wallet set up, it's time to transfer your SOL from Coinbase to Phantom. Here's how:</p>
      <ol>
        <li>Open your Phantom wallet extension and click on "Deposit".</li>
        <li>Select "Solana" and copy your Solana address (it starts with a string of letters and numbers).</li>
        <li>Log in to your Coinbase account.</li>
        <li>Click on "Send/Receive" at the top of the page.</li>
        <li>Choose "Send" and select Solana (SOL) as the asset to send.</li>
        <li>Paste your Phantom wallet address in the "To" field.</li>
        <li>Enter the amount of SOL you want to send. For this tutorial, send all the SOL you purchased (minus the network fee).</li>
        <li>Double-check the address and amount, then click "Continue".</li>
        <li>Review the transaction details and confirm the transfer.</li>
      </ol>
      <p>Important notes:</p>
      <ul>
        <li>Always double-check the wallet address before sending. Cryptocurrency transactions are irreversible.</li>
        <li>Coinbase may require additional security steps (like 2FA) to confirm the transaction.</li>
        <li>The transfer may take a few minutes to complete. You can check its status in your Coinbase account.</li>
      </ul>
      <p>Once the transfer is complete, you should see the SOL in your Phantom wallet. You're now ready to connect your wallet to our dApp in the next step!</p>
    </Step>
  );
};

export default TransferToPhantom;
