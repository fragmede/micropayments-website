import React, { useState } from 'react';

const ToggleComponent = ({ title, children, defaultVisible = false }) => {
  const [isVisible, setIsVisible] = useState(defaultVisible);

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
      {isVisible && <div>{children}</div>}
    </div>
  );
};

export default ToggleComponent;
