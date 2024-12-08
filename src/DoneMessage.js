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

            <p>Question is, how do you get this button on your web page?
            It's unfortunately a rather involved process, but the source code for this website is available on <a href="https://github.com/fragmede/micropayments-website">github. </a>
            </p>


            <ul>
            </ul>
            <p>Thank you for completing this tutorial. We hope you found it informative and enjoyable!</p>


            

        </Step>
    );
};

export default DoneMessage;
