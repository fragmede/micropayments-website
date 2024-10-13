import React, { useState, useEffect } from 'react';

const Step = ({ title, children, onNext = () => {}, onPrev = () => {}, onSel = () => {}, visible = false, isLast = false }) => {
    const [isVisible, setIsVisible] = useState(visible);

    useEffect(() => {
        setIsVisible(visible);
    }, [visible]);

    const toggleVisibility = () => {
        onSel();
        setIsVisible((prev) => !prev);
    };

    return (
        <div className="step">
            <div 
                onClick={toggleVisibility} 
                className="step-header"
                role="button"
                aria-expanded={isVisible}
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && toggleVisibility()}
            >
                <span className={`step-arrow ${isVisible ? 'expanded' : ''}`}>
                    ▶
                </span>
                <h3 className="step-title">{title}</h3>
            </div>
            {isVisible && (
                <div className="step-content">
                    {children}
                    <div className="step-buttons">
                        <button onClick={onPrev} className="btn btn-secondary">Previous</button>
                        {!isLast && <button onClick={onNext} className="btn btn-primary">Next</button>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Step;
