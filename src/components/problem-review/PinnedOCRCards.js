import React, {Component} from 'react';
import {Button, Offcanvas, Alert, Spinner, Col, Row} from 'react-bootstrap';
import OCRResultReviewCard from '../ocr-review/OCRResultReviewCard';
import OCRCardsInfo from '../helpers/OCRCardsInfo';
import API from "../../api";

class PinnedOCRCards extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showPinnedOCR: false,
            error: null,
            isLoaded: false,
            results: [],
            upload: null,
            images: [],
            OCRCardsInfoConfig: []
        }

        this.content = this.content.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.onOpenPinnedOCRClick = this.onOpenPinnedOCRClick.bind(this);
        this.onClosePinnedOCRClick = this.onClosePinnedOCRClick.bind(this);
        this.getOCRCardsInfoObject = this.getOCRCardsInfoObject.bind(this);
    }

    componentDidMount() {
        const _OCRCardsInfo = this.getOCRCardsInfoObject();
        _OCRCardsInfo.getOCRCardsInfo();
    }

    getOCRCardsInfoObject() {
        const _OCRCardsInfo = new OCRCardsInfo(
            (newState) => this.setState(newState),
            () => this.state,
            undefined,
            this.props.problemId,
            "problem_review");
        
        return _OCRCardsInfo;
    }

    onOpenPinnedOCRClick() {
        this.setState({showPinnedOCR: true});
    }

    onClosePinnedOCRClick() {
        this.setState({showPinnedOCR: false});
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
        let {error, isLoaded, results, upload} = this.state;

        const _OCRCardsInfo = this.getOCRCardsInfoObject();

        if (error) {
            return <Alert variant="danger">Error: {error.message}</Alert>;
        } else if (!isLoaded) {
            return <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>;
        } else {
            const doneImages = this.state.images.length === this.state.upload.convertedFiles.length;
            return <Row xs={1} className="g-4">
                {
                    results.map(result => <Col key={result.id}>
                        <OCRResultReviewCard upload={upload} result={result} updateResults={_OCRCardsInfo.getResults}
                                             updateProblem={this.props.updateProblem}
                                             image={doneImages ? this.state.images[result.rect.page] : null}
                                             onSave={this.handleSave} onSelect={() => {}} />
                    </Col>)
                }
            </Row>;
        }
    }

    render() {
        return (
            <>
                <Button size="sm"
                        variant="outline-primary"
                        onClick={this.onOpenPinnedOCRClick}>Pinned OCRs</Button>

                <Offcanvas placement="end"
                           style={{width: "45%"}}
                           show={this.state.showPinnedOCR}
                           onHide={this.onClosePinnedOCRClick}>
                    <Offcanvas.Header closeButton>
                        <Offcanvas.Title>Pinned OCRs</Offcanvas.Title>
                    </Offcanvas.Header>

                    <Offcanvas.Body>
                        {this.content()}
                    </Offcanvas.Body>
                </Offcanvas>
            </>
        )
    }
}

export default PinnedOCRCards;
