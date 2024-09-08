import React, { Component } from 'react';

class Step extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isVisible: props.visible || false
        };
        console.log('state visi9ble ' + this.state.isVisible);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.visible !== this.props.visible) {
            this.setState({ isVisible: this.props.visible });
        }
    }

    toggleVisibility = () => {
        this.setState((prevState) => ({ isVisible: !prevState.isVisible }));
    };

    render() {
        const { title, children, onNext = () => {} } = this.props;
        console.log('next');
        console.log(onNext);
        const { isVisible } = this.state;
        console.log('render vis ' + isVisible);

        return (
            <div>
                <div onClick={this.toggleVisibility} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <span style={{ transform: isVisible ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                        ▶
                    </span>
                    <span style={{ marginLeft: '5px' }}>{title}</span>
                </div>
                {isVisible && (
                    <div>
                        <h2>{title}</h2>
                        {children}
                        <button onClick={onNext}>Next</button>
                    </div>
                )}
            </div>
        );
    }
}

export default Step;
