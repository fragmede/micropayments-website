import React from 'react';
import Step from './Step';

const CreateAccount = ({...props}) => {
    return (
        <Step title="🏗️ Create Your Digital Account" {...props}>
            <p>To get started with online micropayments, we first need to set you up with a Coinbase account. Coinbase is a secure platform for managing digital currencies.</p>
            <p>Follow these steps to create your account:</p>
            <ol>
                <li>🖱️ Click on the Coinbase logo below to visit their website.</li>
                <li>🚀 Click the "Sign up" button on the Coinbase homepage.</li>
                <li>📝 Enter your name and email address.</li>
                <li>🔐 Create a strong, unique password for your account.</li>
                <li>📧 Check your email inbox and click the verification link from Coinbase.</li>
                <li>📸 Complete the identity verification process by following their instructions.</li>
            </ol>
            <p>Once you've completed these steps, you'll be ready to move on to the next part of our guide!</p>
            <a href="https://www.coinbase.com/" target="_blank" rel="noopener noreferrer">
                <img src="/assets/coinbase.svg" alt="Coinbase Logo" style={{maxWidth: '200px', cursor: 'pointer'}}/>
            </a>
            <p>👆 Click the Coinbase logo above to get started with creating your account.</p>
        </Step>
    );
};

export default CreateAccount;
