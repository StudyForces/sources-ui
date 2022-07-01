import React, {Component} from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

class UploadFileModal extends Component {
    constructor(props) {
        super(props);

        this.state={
            file: null
        }
        
        this.uploadFile = this.uploadFile.bind(this);
    }

    uploadFile() {
        //Method for uploading file
    }

    render() {
        return(
            <Modal show={this.props.showModal} onHide={this.props.closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Add file to upload</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <input type="file" accept="image/png,image/jpeg,image/gif,application/pdf"
                        onChange={(event) => this.setState({file: event.target.files[0]})} />
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="outline-success" onClick={this.uploadFile}>
                        Upload
                    </Button>
                    <Button variant="outline-secondary" onClick={this.props.closeModal}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }
}

export default UploadFileModal;