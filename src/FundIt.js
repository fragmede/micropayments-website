import React from 'react';
import Step from './Step';

class FundIt extends Step {
    constructor(props) {
        console.log('fundit');
        super(props);
    }
  render() {
    return (
      <Step title="Fund It">
        <p>Funding functionality will be implemented here.</p>
      </Step>
    );
  }
}

export default FundIt;
