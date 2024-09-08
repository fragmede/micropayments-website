import React from 'react';
import Step from './Step';

const CreateAccount = ({ onNext }) => {
    console.log('createacc');

    return (
        <Step title="Create a New Account" onNext={onNext}>
            <p>Account creation functionality will be implemented here.</p>
        </Step>
    );
};

export default CreateAccount;
