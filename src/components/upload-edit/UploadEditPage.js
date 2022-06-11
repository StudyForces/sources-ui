import React, { Component } from 'react';
import {Container, Alert, Spinner} from "react-bootstrap";
import UploadRectsEditor from './UploadRectsEditor';
import API from "../../api";

class UploadEditPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            upload: null
        };
    }

    componentDidMount() {
        API.sourceUploads.get(parseInt(this.props.match.params.id, 10))
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        upload: result,
                    });
                },
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error,
                        upload: null,
                    });
                }
            );
    }

    content() {
        const { error, isLoaded, upload } = this.state;
        if (error) {
            return <Alert variant="danger">Error: {error.message}</Alert>;
        } else if (!isLoaded) {
            return <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>;
        } else {
            return (
                <Alert variant="primary">
                    <UploadRectsEditor 
                        upload = { upload }
                        />
                </Alert>
            );
        }
    }

    render() {
        return (
            <Container className="mt-3">
                <h1>Upload Edit</h1>
                {this.content()}
            </Container>
        );
    }
}

export default UploadEditPage;
