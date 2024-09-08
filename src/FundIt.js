import React from 'react';
import Step from './Step';

const FundIt = ({ onNext, visible = false }) => {
    console.log('fundit '+ visible);

    return (
        <Step title="Fund It" onNext={onNext} visible={visible}>
            <p>Funding functionality will be implemented here.</p>
        </Step>
    );
};

export default FundIt;
