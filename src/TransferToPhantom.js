import React from 'react';
import Step from './Step';

const TransferToPhantom = ({...props}) => {
  return (
    <Step title="Transfer to Phantom" {...props}>
      <p>Once you've installed phantom and created an account/wallet, you can now send money to  yourself. Send yourself the minimum amount.</p>
    </Step>
  );
};

export default TransferToPhantom;
