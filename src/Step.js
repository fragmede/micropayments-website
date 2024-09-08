import React from 'react';

class Step extends React.Component {
  render() {
    const { title, children, onNext } = this.props;
    return (
      <div>
        <h2>{title}</h2>
        {children}
        {onNext && <button onClick={onNext}>Next</button>}
      </div>
    );
  }
}

export default Step;
