import React from 'react';
import Step from './Step';

class CreateAccount extends Step {
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
