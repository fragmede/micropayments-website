import React from 'react';

class Step extends React.Component {
  render() {
    const { title, children } = this.props;
    const onNext = this.props.onNext || (() => {});
    return (
      <div>
        <h2>{title}</h2>
        {children}
        <button onClick={onNext}>Next</button>
      </div>
    );
  }
}

export default Step;
