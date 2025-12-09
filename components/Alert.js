import { useState } from 'react'
import Alert from 'react-bootstrap/Alert'

const FullAlert = props => {
    const [show, setShow] = useState(false)
    if (props.show) setShow(true)
    
    return (
        <Alert 
            show={show} 
            variant={props.variant || 'light'}
            onClose={() => setShow(false)} 
            dismissible
        >
            <Alert.Heading>{props.title || 'Message'}</Alert.Heading>
            {
                props.details
                ?
                <p>
                    {props.details}
                </p>
                :
                ''
            }
        </Alert>
    );
};

export default FullAlert;