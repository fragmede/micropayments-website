import React, { useState, useEffect } from 'react';

const Step = ({ title, children, onNext = () => {}, onPrev = () => {}, onSel = () => {}, visible = false, isLast = false }) => {
    console.log("visible " + visible);
    const [isVisible, setIsVisible] = useState(visible);

    useEffect(() => {
        setIsVisible(visible);
    }, [visible]);

    const toggleVisibility = () => {
        
        console.log('onsel '  );
        onSel();
        setIsVisible((prev) => !prev);
    };

    return (
        <div>
            <div onClick={toggleVisibility} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <span style={{ transform: isVisible ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                    ▶
                </span>
                <span style={{ marginLeft: '5px' }}>{title}</span>
            </div>
            {isVisible && (
                <div>
                    <h2>{title}</h2>
                    {children}

                    <button onClick={onPrev}>Prev</button>
                    {!isLast && (
                    <button onClick={onNext}>Next</button>)}
                </div>
            )}
        </div>
    );
};

export default Step;
