import React, {Component, createRef, useState} from 'react';
import {Modal, Button, Spinner, Row, Alert, Col, Table, ButtonGroup, Dropdown} from 'react-bootstrap';
import API from "../../api";

function UploadFileRow(props) {
    const [files, setFiles] = useState();
    const [error, setError] = useState();
    const [loading, setLoading] = useState(false);
    const [fileInput, setFileInput] = useState(null);

    return <>
        { error ? <Alert variant="danger">
            {error}
        </Alert> : null}
        <Row className="m-0 p-0">
            <Col className="m-0 p-0">
                <input type="file" accept="image/png,image/jpeg,image/gif,application/pdf"
                       multiple={true}
                       onChange={(event) => {
                           setFiles(Array.from(event.target.files));
                           setFileInput(event.target);
                       }} />
            </Col>
            <Col md="auto" className="m-0 p-0">
                {
                    loading ? <Spinner animation="border" role="status" size="sm">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner> : <Button variant="outline-secondary" size="sm" onClick={() => {
                        setError(null);
                        setLoading(true);
                        Promise.all(files.map(async file => await API.files.upload(file, API.files.UploadType.SOURCE)))
                            .then(files => {
                                fileInput.files = null;
                                fileInput.value = null;
                                setLoading(false);
                                props.onUploaded(files);
                            }, err => {
                                setError(err);
                                setLoading(false);
                            })
                    }}>Upload</Button>
                }
            </Col>
        </Row>
    </>;
}

class UploadFilesModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            newFiles: [],
            blobURLs: []
        }

        this.preview = this.preview.bind(this);
        this.handleRemove = this.handleRemove.bind(this);
    }

    preview(fileName) {
        API.files.view(fileName)
            .then(
                (result) => {
                    const url = URL.createObjectURL(result);
                    this.setState({blobURLs: [...this.state.blobURLs, url]}, () => {
                        window.open(url, 'newwin');
                    });
                },
                (error) => {
                    alert(`Something went wrong! ${error}`);
                }
            )
    }

    handleRemove(idx) {
        const { newFiles } = this.state;
        newFiles.splice(idx, 1);
        this.setState({ newFiles });
    }

    render() {
        return (
            <Modal show={this.props.showModal} onHide={this.props.closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{this.props.title}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <UploadFileRow onUploaded={(newFiles) => {
                        this.setState({newFiles: [...this.state.newFiles, ...newFiles.map(f => f.fileName)]})
                    }}></UploadFileRow>

                    <Table striped hover size="sm">
                        <thead>
                        <tr>
                            <th>File</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            (this.props.existingFiles || []).length > 0 ? <tr className="text-truncate">
                                <td colSpan={2}>Previous Files: {(this.props.existingFiles || []).length}</td>
                            </tr> : null
                        }
                        {
                            this.state.newFiles.map((file, idx) => <tr key={file}>
                                <td>{file}</td>
                                <td>
                                    <Dropdown as={ButtonGroup} size="sm" className="align-middle">
                                        <Button size="sm" variant="outline-secondary" onClick={() => {
                                            this.preview(file)
                                        }}>Preview</Button>

                                        <Dropdown.Toggle split variant="outline-secondary"/>

                                        <Dropdown.Menu>
                                            <Dropdown.Item className="text-danger" onClick={() => {
                                                this.handleRemove(idx);
                                            }}>Delete</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </td>
                            </tr>)
                        }
                        </tbody>
                    </Table>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="outline-primary" onClick={(this.props.existingFiles || []).length + this.state.newFiles.length > 0 ?
                        () => {
                        this.props.onSave([...(this.props.existingFiles || []), ...this.state.newFiles],
                            this.props.closeModal, (e) => {
                                alert(e);
                            })
                    } : null} disabled={!((this.props.existingFiles || []).length + this.state.newFiles.length > 0)}>
                        Save
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
