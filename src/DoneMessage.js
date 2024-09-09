import React from 'react';
import Step from './Step';

const DoneMessage = ({...props}) => {
    return (
        <Step title="all done" isLast="true" {...props}>
            <p>yay! 🎉🚀🌖</p>
            <p>Thank you!</p>
            <p>What now?</p>
            <p>Yeah I dunno.</p>
        </Step>
    );
};

export default DoneMessage;
