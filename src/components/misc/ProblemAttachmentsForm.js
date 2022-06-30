import React, {Component, useState} from 'react';
import {Button, ButtonGroup, Dropdown, Spinner, Table} from "react-bootstrap";
import API from "../../api";

function CreateAttachmentRow(props) {
    const [file, setFile] = useState();
    const [error, setError] = useState();
    const [loading, setLoading] = useState(false);

    return (
        <tr>
            <td className="text-truncate align-middle">new</td>
            <td className="text-truncate align-middle">
                <input type="file" accept="image/*" onChange={(event) => setFile(event.target.files[0])}/>
            </td>
            <td className="text-truncate align-middle">{error ? error.message : ''}</td>
            <td>
                {
                    loading ? <Spinner animation="border" role="status" size="sm">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner> : <Button variant="outline-secondary" size="sm" onClick={() => {
                        setError(null);
                        setLoading(true);
                        API.files.upload(file, API.files.UploadType.ATTACHMENT)
                            .then(
                                (result) => {
                                    props.onDone({
                                        fileName: result.fileName
                                    });
                                    setLoading(false);
                                },
                                (error) => {
                                    setError(error);
                                    setLoading(false);
                                }
                            );
                    }}>Upload</Button>
                }

            </td>
        </tr>
    );
}

class ProblemAttachmentsForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            attachments: null,
            blobURLs: []
        }

        this.handleCreate = this.handleCreate.bind(this);
        this.handleRemove = this.handleRemove.bind(this);
        this.preview = this.preview.bind(this);
    }

    static getDerivedStateFromProps(props, state) {
        return {
            attachments: state.attachments || props.attachments || []
        }
    }

    componentWillUnmount() {
        this.state.blobURLs.forEach(url => URL.revokeObjectURL(url));
    }

    preview(attachment) {
        API.files.view(attachment.fileName)
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

    handleCreate(attachment) {
        this.setState({attachments: [...this.state.attachments, attachment]}, () => {
            this.props.onChange(this.state.attachments);
        })
    }

    handleRemove(idx) {
        const { attachments } = this.state;
        attachments.splice(idx, 1);
        this.setState({ attachments }, () => {
            this.props.onChange(this.state.attachments);
        });
    }

    render() {
        return <Table responsive striped hover size="sm">
            <thead>
            <tr>
                <th>#</th>
                <th colSpan={2}>File</th>
                <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            <CreateAttachmentRow onDone={this.handleCreate}></CreateAttachmentRow>
            {
                this.state.attachments.map((attachment, index) => <tr key={attachment.fileName}>
                    <td className="align-middle">{index + 1}</td>
                    <td className="align-middle" colSpan={2}>{attachment.fileName}</td>
                    <td className="align-middle">
                        <Dropdown as={ButtonGroup} size="sm" className="align-middle">
                            <Button size="sm" variant="outline-secondary" onClick={() => {
                                this.preview(attachment)
                            }}>Preview</Button>

                            <Dropdown.Toggle split variant="outline-secondary"/>

                            <Dropdown.Menu>
                                <Dropdown.Item className="text-danger" onClick={() => {
                                    this.handleRemove(index);
                                }}>Delete</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </td>
                </tr>)
            }
            </tbody>
        </Table>;
    }
}

export default ProblemAttachmentsForm;
