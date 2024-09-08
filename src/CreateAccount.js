import React, { useState } from 'react';

const CreateAccount = ({ onNext }) => {
  return (
    <div>
      <h2>Create a New Account</h2>
      <p>Account creation functionality will be implemented here.</p>
      <button onClick={onNext}>Next</button>
    </div>
  );
};

export default CreateAccount;
