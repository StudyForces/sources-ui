import React, {Component} from 'react';
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

        this.load = this.load.bind(this);
    }

    componentDidMount() {
        this.load();
    }

    load() {
        API.sourceUploads.get(parseInt(this.props.match.params.id, 10))
            .then(
                (result) => {
                    if (result.convertedFiles.length === 0) {
                        this.load();
                        return;
                    }

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
            return <Spinner animation="border" role="status" className="text-center">
                <span className="visually-hidden">Loading...</span>
            </Spinner>;
        } else {
            return (
                <>
                    <UploadRectsEditor upload={upload} {...this.props}/>
                </>
            );
        }
    }

    render() {
        return (
            <Container>
                {this.content()}
            </Container>
        );
    }
}

export default UploadEditPage;
