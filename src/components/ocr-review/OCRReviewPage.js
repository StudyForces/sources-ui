import React, {Component} from 'react';
import {Container, Alert, Spinner, Col, Row} from "react-bootstrap";
import API from "../../api";
import OCRResultReviewCard from "./OCRResultReviewCard";
import ProblemSubmissionForm from "./ProblemSubmissionForm";

class OCRReviewPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            results: [],
            upload: null,
            selected: [],
            images: []
        };

        this.handleSave = this.handleSave.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    componentDidMount() {
        const id = parseInt(this.props.match.params.id, 10);
        Promise.all([
            API.uploads.getOCRResults(id),
            API.uploads.get(id)
        ])
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        results: result[0],
                        upload: result[1],
                    });
                    this.loadImage(result[1]);
                },
                (error) => {
                    this.state.images.forEach(image => {
                        URL.revokeObjectURL(image.src);
                    });
                    this.setState({
                        isLoaded: true,
                        error,
                        results: [],
                        upload: null,
                        images: [],
                    });
                }
            );
    }

    loadImage(upload) {
        let counter = 0;
        let images = Array.from({length: upload.convertedFiles.length});
        const updState = (idx, image) => {
            images[idx] = image;
            counter++;
            if (counter === upload.convertedFiles.length) {
                this.setState({images});
            }
        };

        Promise.all(upload.convertedFiles.map(file => API.files.view(file.file)))
            .then(
                (results) => {
                    results.forEach((result, idx) => {
                        const imgUrl = URL.createObjectURL(result);
                        const image = new Image();
                        image.src = imgUrl;
                        image.onload = () => {
                            updState(idx, image);
                        }
                    })
                },
                (error) => {
                    this.state.images.forEach(image => {
                        URL.revokeObjectURL(image.src);
                    });
                    this.setState({
                        isLoaded: true,
                        error,
                        results: [],
                        upload: null,
                        images: null
                    });
                }
            );
    }

    componentWillUnmount() {
        this.state.images.forEach(image => {
            URL.revokeObjectURL(image.src);
        });
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
        const {selected} = this.state;

        const idx = selected.findIndex(id => id === result.id);

        if (selection && idx === -1) {
            selected.push(result.id);
        } else if (!selection && idx !== -1) {
            selected.splice(idx, 1);
        }

        this.setState({selected});
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
            const doneImages = this.state.images.length === this.state.upload.convertedFiles.length;
            return results.map(result =>
                <Col key={result.id}>
                    <OCRResultReviewCard result={result} image={doneImages ? this.state.images[result.rect.page] : null}
                                         selected={this.state.selected.findIndex(r => r === result.id) !== -1}
                                         onSave={this.handleSave} onSelect={this.handleSelect}></OCRResultReviewCard>
                </Col>);
        }
    }

    onSubmit(cb) {
        const {results} = this.state;
        this.setState({selected: [], results: []}, () => {
            this.setState({results});
            cb()
        });
    }

    render() {
        return (
            <Container>
                <Row cols={2} md>
                    <Col sm className="overflow-scroll" style={{height: 'calc(100vh - 56px)'}}>
                        <div className="sticky-top py-3 bg-white-blurred" style={{zIndex: 100}}>
                            <h1>Review Upload #{this.props.match.params.id}</h1>
                        </div>
                        <Row xs={1} className="g-4">
                            {this.contentResults()}
                        </Row>
                    </Col>
                    <Col sm className="overflow-scroll" style={{height: 'calc(100vh - 56px)'}}>
                        <div className="sticky-top py-3 bg-white-blurred" style={{zIndex: 100}}>
                            <h2>New Problem</h2>
                        </div>
                        <ProblemSubmissionForm selected={this.state.selected.map(id =>
                            this.state.results.find(r => r.id === id))} {...this.props}
                                               onSubmit={this.onSubmit}>
                        </ProblemSubmissionForm>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default OCRReviewPage;
