import React from 'react';
import Step from './Step';

const GetSol = ({...props}) => {
  return (
    <Step title="Purchase Solana (SOL)" {...props}>
      <p>Now that your Coinbase account is funded, it's time to purchase a small amount of Solana (SOL). Here's how to do it:</p>
      <ol>
        <li>Log in to your Coinbase account.</li>
        <li>Click on "Buy/Sell" at the top of the page.</li>
        <li>Select "Buy" and choose Solana (SOL) from the list of cryptocurrencies.</li>
        <li>Enter the amount you want to buy. For this tutorial, we recommend purchasing about $5 worth of SOL.</li>
        <li>Review the transaction details, including the fees.</li>
        <li>Confirm your purchase.</li>
      </ol>
      <p>Important notes:</p>
      <ul>
        <li>The price of SOL fluctuates, so the exact amount you receive may vary slightly.</li>
        <li>Coinbase charges a small fee for cryptocurrency purchases. This will be included in the transaction details.</li>
        <li>After confirming your purchase, it may take a few minutes for the SOL to appear in your Coinbase account.</li>
      </ul>
      <p>Once you've successfully purchased SOL, you're ready to move on to the next step: installing the Phantom wallet!</p>
    </Step>
  );
};

export default GetSol;
