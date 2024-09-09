import React from 'react';
import Step from './Step';

const InstallPhantom = ({...props}) => {
  return (
    <Step title="Install Phantom Wallet" {...props}>
      <p>To use this application, please install the Phantom Wallet extension.</p>
      <a href="https://phantom.app/" target="_blank" rel="noopener noreferrer">
        Install Phantom
      </a>
    </Step>
  );
};

export default InstallPhantom;
