import React from 'react';
import Step from './Step';

const CreateAccount = ({...props}) => {
    return (
        <Step title="Create a New Account" {...props}>
            <p>To get started with micropayments, you'll need to create a Coinbase account. Coinbase is a secure platform that makes it easy to buy, sell, and store cryptocurrency.</p>
            <p>Follow these steps to create your account:</p>
            <ol>
                <li>Visit the Coinbase website by clicking on the logo below.</li>
                <li>Click on the "Get started" button on the Coinbase homepage.</li>
                <li>Fill in your personal information, including your name and email address.</li>
                <li>Create a strong password for your account.</li>
                <li>Verify your email address by clicking on the link sent to your inbox.</li>
                <li>Complete the identity verification process by providing the required documents.</li>
            </ol>
            <p>Once your account is set up, you'll be ready for the next steps in making micropayments!</p>
            <a href="https://www.coinbase.com/" target="_blank" rel="noopener noreferrer">
                <img src="/assets/coinbase.svg" alt="Coinbase Logo" style={{maxWidth: '200px', cursor: 'pointer'}}/>
            </a>
            <p>Click the Coinbase logo above to go to their website and create your account.</p>
        </Step>
    );
};

export default CreateAccount;
