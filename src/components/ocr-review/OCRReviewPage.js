import React, {Component} from 'react';
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
            upload: null,
            selected: [],
        };

        this.handleSave = this.handleSave.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
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

    handleSelect(result, selection) {
        const { selected } = this.state;

        const idx = selected.findIndex(id => id === result.id);

        if (selection && idx === -1) {
            selected.push(result.id);
        } else if (!selection && idx !== -1) {
            selected.splice(idx, 1);
        }

        this.setState({ selected });
    }

    contentResults() {
        const {error, isLoaded, results} = this.state;
        if (error) {
            return <Alert variant="danger">Error: {error.message}</Alert>;
        } else if (!isLoaded) {
            return <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>;
        } else {
            return results.map(result =>
                <OCRResultReviewCard key={result.id} result={result}
                                     onSave={this.handleSave} onSelect={this.handleSelect}></OCRResultReviewCard>);
        }
    }

    render() {
        return (
            <Container>
                <Row cols={2} md>
                    <Col sm className="overflow-scroll" style={{height: 'calc(100vh - 56px)'}}>
                        <div className="mt-3">
                            <h1>Review Upload #{this.props.match.params.id}</h1>
                            Selected: {this.state.selected.length}
                        </div>
                    </Col>
                    <Col sm className="overflow-scroll" style={{height: 'calc(100vh - 56px)'}}>
                        <div className="mt-3">
                            {this.contentResults()}
                        </div>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default OCRReviewPage;
