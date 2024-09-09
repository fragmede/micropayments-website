import React from 'react';
import Step from './Step';

const CreateAccount = ({...props}) => {
    return (
        <Step title="Create a New Account" {...props}>
            <p>Go to <a href="https://www.coinbase.com/">
            <img src="/assets/coinbase-icon.ico"/>Coinbase</a> and make an account.</p>
            <img src="/assets/coinbase.svg"/>
        </Step>
    );
};

export default CreateAccount;
