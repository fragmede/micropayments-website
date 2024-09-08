import React from 'react';
import Step from './Step';

const CreateAccount = ({ onNext, visible = false }) => {
    console.log('createacc ' + visible);

    return (
        <Step title="Create a New Account" onNext={onNext} visible={visible}>
            <p>go make a coinbase account.</p>
            <p>Account creation functionality will be implemented here.</p>
        </Step>
    );
};

export default CreateAccount;
