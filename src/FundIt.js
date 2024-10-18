import React from 'react';
import Step from './Step';

const FundIt = ({...props}) => {
    return (
        <Step title="💰 Fill Your Crypto Piggy Bank" {...props}>
            <p>Woohoo! You've got a shiny new Coinbase account. Now it's time to make it rain... well, more like a light drizzle. We're talking micropayments here, folks! 🌧️</p>
            <p>Here's how to sprinkle some USD into your Coinbase account:</p>
            <ol>
                <li>🔐 Sneak into your Coinbase vault (a.k.a. log in).</li>
                <li>🔍 Hunt for the elusive "Add a payment method" button. It's playing hide and seek!</li>
                <li>🎭 Choose your financial superhero (bank account, debit card, or wire transfer).</li>
                <li>🤝 Follow the prompts to befriend your chosen payment method.</li>
                <li>💼 Once you've made a new friend, click on "Buy/Sell" at the top. It's like a crypto vending machine!</li>
                <li>💸 Select "Deposit" and pick USD (because we're not ready for galactic credits yet).</li>
                <li>🔢 Type in how much you want to deposit. We suggest at least $10 (think of it as your crypto allowance).</li>
                <li>👀 Double-check everything like you're diffusing a bomb in an action movie, then hit confirm!</li>
            </ol>
            <p>⏳ Time-travel warning: Depending on your payment method, your money might take a scenic route to your account. Bank transfers are like snail mail (3-5 business days), while debit cards are more like teleportation (instant)!</p>
            <p>Once your account is loaded, you'll be ready to go SOL searching in the next step! Get ready to become a crypto-billionaire... of cents! 🤑</p>
        </Step>
    );
};

export default FundIt;
