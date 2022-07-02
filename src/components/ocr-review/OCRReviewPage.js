import React, {Component} from 'react';
import {Container, Alert, Spinner, Col, Row, Form} from "react-bootstrap";
import API from "../../api";
import OCRResultReviewCard from "./OCRResultReviewCard";
import ProblemSubmissionForm from "./ProblemSubmissionForm";
import PaginationComponent from "../misc/PaginationComponent";
import { getOCRCardsInfo } from '../helpers/getOCRCardsInfo';

class OCRReviewPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            results: [],
            upload: null,
            selected: [],
            images: [],
            filteringPage: false,
            currentPage: 0,
        };

        this.handleSave = this.handleSave.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.setPage = this.setPage.bind(this);
        this.handleFilteringPage = this.handleFilteringPage.bind(this);
    }

    componentDidMount() {
        const id = parseInt(this.props.match.params.id, 10);
        getOCRCardsInfo(
            "upload_review",
            (newState) => this.setState(newState), 
            () => this.state.images,
            id);
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
        let {error, isLoaded, results, filteringPage, currentPage} = this.state;

        if (filteringPage) {
            results = results.filter(result => result.rect.page === currentPage);
        }

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

    setPage(page) {
        this.setState({currentPage: page - 1, filteringPage: true});
    }

    handleFilteringPage(e) {
        this.setState({filteringPage: e.target.checked});
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
                        <Row className="sticky-bottom py-2 mx-auto bg-white-blurred align-items-center justify-content-center"
                             style={{zIndex: 100}} sm={2}>
                            <Col sm="auto">
                                <Form.Check type="checkbox"
                                            checked={this.state.filteringPage}
                                            onChange={this.handleFilteringPage} />
                            </Col>
                            <Col sm="auto">
                                {
                                    this.state.images.length > 1 ? <PaginationComponent
                                        currentPage={this.state.currentPage + 1}
                                        itemsCount={this.state.images.length}
                                        itemsPerPage={1}
                                        setCurrentPage={this.setPage}/> : null
                                }
                            </Col>
                        </Row>
                    </Col>
                    <Col sm className="overflow-scroll" style={{height: 'calc(100vh - 56px)'}}>
                        <div className="sticky-top py-3 bg-white-blurred" style={{zIndex: 100}}>
                            <h2>New Problem</h2>
                        </div>
                        <ProblemSubmissionForm selected={this.state.selected.map(id =>
                            this.state.results.find(r => r.id === id))} {...this.props}
                                               onSubmit={this.onSubmit} upload={this.state.upload}>
                        </ProblemSubmissionForm>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default OCRReviewPage;
