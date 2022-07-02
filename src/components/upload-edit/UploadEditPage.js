import React, {Component} from 'react';
import {Container, Alert, Spinner} from "react-bootstrap";
import UploadEditor from './UploadEditor';
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
        this.reload = this.reload.bind(this);
    }

    interval;

    componentDidMount() {
        this.interval = setInterval(this.load, 500);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    reload() {
        this.setState({
            error: null,
            isLoaded: false,
            upload: null
        }, () => this.interval = setInterval(this.load, 1000));
    }

    load() {
        API.uploads.get(parseInt(this.props.match.params.id, 10))
            .then(
                (result) => {
                    if (result.convertedFiles.length > 0 && result.metadata !== null &&
                        result.convertedFiles.length === result.metadata.pages) {
                        clearInterval(this.interval);
                    } else {
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
                    <UploadEditor upload={upload} {...this.props} reload={this.reload}/>
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
