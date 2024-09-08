import React, { useState, useEffect } from 'react';

const ToggleStep = ({ title, children, visible, onNext }) => {
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    setIsVisible(visible);
  }, [visible]);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
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
          {children}
          <button onClick={onNext}>Next</button>
        </div>
      )}
    </div>
  );
};

export default ToggleStep;