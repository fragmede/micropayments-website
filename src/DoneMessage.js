import React from 'react';
import Step from './Step';

const DoneMessage = ({...props}) => {
    return (
        <Step title="all done" isLast="true" {...props}>
            <p>blahblahblahblahblahblahblah</p>
        </Step>
    );
};

export default DoneMessage;
