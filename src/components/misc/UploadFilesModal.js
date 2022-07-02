import React, {Component} from 'react';
import {Modal, Button} from 'react-bootstrap';

class UploadFilesModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            files: null
        }

        this.uploadFiles = this.uploadFiles.bind(this);
    }

    uploadFiles() {
        // Method for uploading file
    }

    render() {
        return (
            <Modal show={this.props.showModal} onHide={this.props.closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Add files to upload</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <input type="file" accept="image/png,image/jpeg,image/gif,application/pdf"
                           onChange={(event) => this.setState({files: Array.from(event.target.files)})}/>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="outline-success" onClick={this.uploadFiles}>
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

export default UploadFilesModal;
