import React from 'react';
import Step from './Step';

const GetSol = ({...props}) => {
  return (
    <Step title="🌞 Catch Some SOL(ana)!" {...props}>
      <p>Alright, crypto-astronaut! Your Coinbase rocket is fueled up. Now it's time to grab some Solana (SOL) - it's like cosmic currency! Here's your mission:</p>
      <ol>
        <li>🔑 Unlock your Coinbase command center (log in).</li>
        <li>🎯 Spot and click the "Buy/Sell" button. It's your launchpad!</li>
        <li>🔍 Select "Buy" and find Solana (SOL) in the crypto constellation.</li>
        <li>💸 Decide how much SOL-ar power you want. We suggest $5 worth - it's not much, but it's honest work!</li>
        <li>🕵️‍♂️ Review the details like you're checking for alien imposters.</li>
        <li>🚀 Hit that confirm button and blast off into the SOLar system!</li>
      </ol>
      <p>⚠️ Cosmic Cautions:</p>
      <ul>
        <li>🎢 SOL prices are on a rollercoaster - your $5 might buy a different amount of SOL tokens each time. It's crypto magic! ✨</li>
        <li>🍟 Coinbase takes a small side of fees with your order. They gotta fuel their own rockets somehow!</li>
        <li>⏳ After you've made your purchase, your SOL might take a quick space nap before appearing in your account. Don't panic!</li>
      </ul>
      <p>Once you've snagged your SOL, you're ready for the next giant leap: summoning the Phantom wallet! 👻🌠</p>
    </Step>
  );
};

export default GetSol;
