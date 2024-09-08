import React from 'react';
import Step from './Step';

class InstallPhantom extends Step {
  render() {
    return (
      <Step title="Install Phantom Wallet">
        <p>To use this application, please install the Phantom Wallet extension.</p>
        <a href="https://phantom.app/" target="_blank" rel="noopener noreferrer">
          Install Phantom
        </a>
      </Step>
    );
  }
}

export default InstallPhantom;
