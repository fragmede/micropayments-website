import React from 'react';
import Step from './Step';

const CreateAccount = ({...props}) => {
    return (
        <Step title="🏗️ Build Your Crypto Castle (a.k.a. Coinbase Account)" {...props}>
            <p>Ready to join the crypto party? First, we need to set you up with a Coinbase account - it's like your VIP pass to the world of digital moolah! 🎉</p>
            <p>Follow these magical steps to summon your account:</p>
            <ol>
                <li>🖱️ Click on the shiny Coinbase logo below (it's your portal to crypto wonderland).</li>
                <li>🚀 Smash that "Get started" button on the Coinbase homepage like you're launching a rocket!</li>
                <li>🕵️‍♂️ Reveal your secret identity (okay, just your name and email).</li>
                <li>🔐 Craft a password so strong, even Houdini couldn't crack it.</li>
                <li>📧 Check your inbox and click the magic link to prove you're not a robot (or are you? 🤖).</li>
                <li>📸 Strike a pose for the identity verification selfie (make it fierce!).</li>
            </ol>
            <p>Once you've completed this quest, you'll be ready to embark on your micropayment adventure! 🗺️</p>
            <a href="https://www.coinbase.com/" target="_blank" rel="noopener noreferrer">
                <img src="/assets/coinbase.svg" alt="Coinbase Logo" style={{maxWidth: '200px', cursor: 'pointer'}}/>
            </a>
            <p>👆 Click this magical Coinbase emblem to begin your journey! May the crypto gods smile upon you! 🙏✨</p>
        </Step>
    );
};

export default CreateAccount;
