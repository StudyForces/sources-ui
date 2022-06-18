import React, { Component } from 'react';
import {Container, Alert, Spinner} from "react-bootstrap";
import API from "../../api";

class OCRReviewPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            upload: null
        };
    }

    componentDidMount() {
        API.sourceUploads.getOCRResults(parseInt(this.props.match.params.id, 10))
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
        const {error, isLoaded, upload} = this.state;
        if (error) {
            return <Alert variant="danger">Error: {error.message}</Alert>;
        } else if (!isLoaded) {
            return <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>;
        } else {
            return <Alert variant="primary">
                <pre>
                    {JSON.stringify(upload, null, 2)}
                </pre>
            </Alert>;
        }
    }

    render() {
        return (
            <Container className="mt-3">
                <h1>OCR Review</h1>
                {this.content()}
            </Container>
        );
    }
}

export default OCRReviewPage;
