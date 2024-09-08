import React from 'react';

class Step extends React.Component {
    const [isVisible, setIsVisible] = useState(visible);

    useEffect(() => {
        setIsVisible(visible);
    }, [visible]);

    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };
    render() {
        const { title, children } = this.props;
        const onNext = this.props.onNext || (() => {});
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
                        <button onClick={onNext}>Next</button>
                    </div>
                )
                }
            </div>
        );
    }
}

export default Step;
