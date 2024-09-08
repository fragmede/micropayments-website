import React from 'react';
import Step from './Step';

import React, { Component } from 'react';
import Step from './Step';

class CreateAccount extends Component {
    constructor(props) {
        console.log('createacc');
        super(props);
    }
    render() {
        return (
            <Step title="Create a New Account">
                <p>Account creation functionality will be implemented here.</p>
            </Step>
        );
    }
}

export default CreateAccount;
