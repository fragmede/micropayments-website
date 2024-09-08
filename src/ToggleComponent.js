import React, { useState } from 'react';

const ToggleComponent = ({ title, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div>
      <button onClick={toggleVisibility}>
        {isVisible ? `Hide ${title}` : `Show ${title}`}
      </button>
      {isVisible && <div>{children}</div>}
    </div>
  );
};

export default ToggleComponent;
