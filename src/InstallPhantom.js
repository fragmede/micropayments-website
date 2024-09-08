import React from 'react';
import Step from './Step';

const InstallPhantom = ({ onNext }) => {
  return (
    <Step title="Install Phantom Wallet" onNext={onNext}>
      <p>To use this application, please install the Phantom Wallet extension.</p>
      <a href="https://phantom.app/" target="_blank" rel="noopener noreferrer">
        Install Phantom
      </a>
    </Step>
  );
};

export default InstallPhantom;
