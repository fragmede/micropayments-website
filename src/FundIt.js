import React from 'react';
import Step from './Step';

const FundIt = ({ onNext }) => {
    console.log('fundit');

    return (
        <Step title="Fund It" onNext={onNext}>
            <p>Funding functionality will be implemented here.</p>
        </Step>
    );
};

export default FundIt;
