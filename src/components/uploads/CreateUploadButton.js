import React, {Component} from 'react';
import {Button} from "react-bootstrap";
import API from "../../api";
import UploadFilesModal from "../misc/UploadFilesModal";

class CreateUploadButton extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showUploadFileModal: false
        }

        this.onOpenUploadFileClick = this.onOpenUploadFileClick.bind(this);
        this.onCloseUploadFileClick = this.onCloseUploadFileClick.bind(this);

        this.send = this.send.bind(this);
    }

    send(files, cb, cbError) {
        this.setState({error: null, loading: true});
        API.uploads.create(files)
            .then(
                (result) => {
                    cb();
                    this.props.history.push(`/uploads/${result.id}`);
                },
                (error) => {
                    cbError(error);
                }
            );
    };

    onOpenUploadFileClick() {
        this.setState({showUploadFileModal: true});
    }

    onCloseUploadFileClick() {
        this.setState({showUploadFileModal: false});
    }

    render() {
        return (
            <>
                <UploadFilesModal
                    title="New Upload"
                    onSave={this.send}
                    showModal={this.state.showUploadFileModal}
                    closeModal={this.onCloseUploadFileClick}/>
                <Button variant="outline-primary" size="sm" onClick={this.onOpenUploadFileClick}>
                    New
                </Button>
            </>
        );
    }
}

export default CreateUploadButton;
