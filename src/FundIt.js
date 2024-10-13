import React from 'react';
import Step from './Step';

const FundIt = ({...props}) => {
    return (
        <Step title="Fund Your Coinbase Account" {...props}>
            <p>Now that you have a Coinbase account, it's time to add some funds. This will allow you to purchase Solana (SOL) in the next step.</p>
            <p>Here's how to add USD to your Coinbase account:</p>
            <ol>
                <li>Log in to your Coinbase account.</li>
                <li>Click on the "Add a payment method" button.</li>
                <li>Choose your preferred payment method (e.g., bank account, debit card, wire transfer).</li>
                <li>Follow the prompts to link your chosen payment method.</li>
                <li>Once your payment method is added, click on "Buy/Sell" at the top of the page.</li>
                <li>Select "Deposit" and choose USD as the currency.</li>
                <li>Enter the amount you want to deposit (we recommend at least $10 to cover the SOL purchase and fees).</li>
                <li>Review the transaction details and confirm the deposit.</li>
            </ol>
            <p>Note: The time it takes for the funds to appear in your account may vary depending on your chosen payment method. Bank transfers typically take 3-5 business days, while debit card purchases are usually instant.</p>
            <p>Once your account is funded, you'll be ready to purchase Solana in the next step!</p>
        </Step>
    );
};

export default FundIt;
