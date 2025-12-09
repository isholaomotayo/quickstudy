import { useState } from 'react'
import { Modal, Button } from 'react-bootstrap'

const AlertModal = props => {
    const [show, setShow] = useState(true)
    const handleClose = () => setShow(false)
    
    return (
        <Modal 
            show={show} 
            onHide={handleClose} 
            //className={`bg-${props.variant || 'white'}`}
        >
            <Modal.Header closeButton>
                <Modal.Title>{props.title || 'Title'}</Modal.Title>
            </Modal.Header>
            {
                props.details
                ?
                <Modal.Body>
                    {props.details}
                </Modal.Body>
                :
                ''
            }
            <Modal.Footer>
                <Button 
                    variant={props.btnVariant || 'success'}
                    onClick={handleClose}
                >
                    Ok
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AlertModal;