import React from 'react';
import Step from './Step';

class CreateAccount extends Step {
  render() {
    return (
      <Step title="Create a New Account" onNext={this.props.onNext}>
        <p>Account creation functionality will be implemented here.</p>
      </Step>
    );
  }
}

export default CreateAccount;
