import React from 'react';
import Step from './Step';

const TransferToPhantom = ({ onNext }) => {
  return (
    <Step title="Transfer to Phantom" onNext={onNext}>
      <p>Functionality to transfer funds to the Phantom wallet will be implemented here.</p>
    </Step>
  );
};

export default TransferToPhantom;
