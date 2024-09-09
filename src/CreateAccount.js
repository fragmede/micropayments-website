import React from 'react';
import Step from './Step';

const CreateAccount = ({...props}) => {
    return (
        <Step title="Create a New Account" {...props}>
            <p>go make a coinbase account.</p>
            <p>Account creation functionality will be implemented here.</p>
        </Step>
    );
};

export default CreateAccount;
