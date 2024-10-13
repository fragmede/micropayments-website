import React from 'react';
import Step from './Step';

const DoneMessage = ({...props}) => {
    return (
        <Step title="Congratulations! You've Completed the Tutorial" isLast={true} {...props}>
            <h3>🎉 Congratulations! 🚀</h3>
            <p>You've successfully completed all steps and made your first Solana micropayment!</p>
            <h4>What you've accomplished:</h4>
            <ul>
                <li>Created a Coinbase account</li>
                <li>Funded your account and purchased SOL</li>
                <li>Set up a Phantom wallet</li>
                <li>Transferred SOL to your Phantom wallet</li>
                <li>Connected your wallet to a dApp</li>
                <li>Made a micropayment on the Solana blockchain</li>
            </ul>
            <h4>What's next?</h4>
            <p>Now that you're familiar with the basics of Solana micropayments, here are some ideas for further exploration:</p>
            <ul>
                <li>Learn more about Solana and its ecosystem at <a href="https://solana.com/" target="_blank" rel="noopener noreferrer">solana.com</a></li>
                <li>Explore other Solana-based applications and services</li>
                <li>Consider building your own dApp using Solana's developer resources</li>
                <li>Stay informed about developments in the world of cryptocurrency and blockchain technology</li>
            </ul>
            <p>Thank you for completing this tutorial. We hope you found it informative and enjoyable!</p>
        </Step>
    );
};

export default DoneMessage;
