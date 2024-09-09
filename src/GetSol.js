import React from 'react';
import Step from './Step';

const GetSol = ({...props}) => {
  //console.log('get sol '+ visible);
  return (
    <Step title="Get SOL" {...props}>
      <p>Buy a trivial amount of Solana (SOL).</p>
    </Step>
  );
};

export default GetSol;
