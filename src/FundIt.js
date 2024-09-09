import React from 'react';
import Step from './Step';

const FundIt = ({...props}) => {
    return (
        <Step title="Fund It" {...props}>
            <p>Funding functionality will be implemented here.</p>
        </Step>
    );
};

export default FundIt;
