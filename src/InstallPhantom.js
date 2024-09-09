import React from 'react';
import Step from './Step';

const InstallPhantom = ({...props}) => {
  return (
    <Step title="Install Phantom Wallet" {...props}>
      <p>To use this application, please install the Phantom Wallet extension.</p>
      <a href="https://phantom.app/" target="_blank" rel="noopener noreferrer">
        <a href="https://phantom.app/download">Install Phantom</a> and create an account.
      </a>
    </Step>
  );
};

export default InstallPhantom;
