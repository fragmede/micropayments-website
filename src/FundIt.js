import React from 'react';
import Step from './Step';

const FundIt = ({...props}) => {
    return (
        <Step title="Fund It" {...props}>
            <p>Add USD to your coinbase account.</p>
        </Step>
    );
};

export default FundIt;
