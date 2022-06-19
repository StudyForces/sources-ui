import React, { Component } from 'react';
import {Container, Alert, Spinner, Col, Row} from "react-bootstrap";
import API from "../../api";
import OCRResultReviewCard from "./OCRResultReviewCard";

class OCRReviewPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            results: [],
            upload: null
        };

        this.handleSave = this.handleSave.bind(this);
    }

    componentDidMount() {
        const id = parseInt(this.props.match.params.id, 10);
        Promise.all([
            API.sourceUploads.getOCRResults(id),
            API.sourceUploads.get(id)
        ])
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        results: result[0].content,
                        upload: result[1],
                    });
                },
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error,
                        results: [],
                        upload: null,
                    });
                }
            );
    }

    handleSave(result, cb) {
        API.ocr.update(result.id, result)
            .then(r => {
                const {results} = this.state;

                const idx = results.findIndex(res => res.id === r.id);

                if (idx !== -1) {
                    results[idx] = r;
                    this.setState({results}, cb);
                }
            });
    }

    content() {
        const {error, isLoaded, results} = this.state;
        if (error) {
            return <Alert variant="danger">Error: {error.message}</Alert>;
        } else if (!isLoaded) {
            return <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>;
        } else {
            return <Row cols={2} md>
                <Col sm>
                    {
                        results.map(result =>
                            <OCRResultReviewCard key={result.id} result={result}
                                                 onSave={this.handleSave}></OCRResultReviewCard>)
                    }
                </Col>
                <Col sm>
                </Col>
            </Row>;
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
