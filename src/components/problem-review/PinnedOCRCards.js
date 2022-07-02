import React, {Component} from 'react';
import { Button, Offcanvas, Alert, Spinner, Col } from 'react-bootstrap';
import OCRResultReviewCard from '../ocr-review/OCRResultReviewCard';
import { getOCRCardsInfo } from '../helpers/getOCRCardsInfo';
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
            images: []
        }

        this.content = this.content.bind(this);
        this.onOpenPinnedOCRClick = this.onOpenPinnedOCRClick.bind(this);
        this.onClosePinnedOCRClick = this.onClosePinnedOCRClick.bind(this);
    }

    componentDidMount() {
        const id = 24007;
        getOCRCardsInfo(
            "problem_review",
            (newState) => this.setState(newState), 
            () => this.state.images,
            id, this.props.problemId)
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
                console.log(this.state.results);
                const results = this.state.results;

                const idx = results.findIndex(res => res.id === r.id);

                if (idx !== -1) {
                    results[idx] = r;
                    this.setState({results}, cb);
                }
            });
    }

    content() {
        let {error, isLoaded, results} = this.state;

        if (error) {
            return <Alert variant="danger">Error: {error.message}</Alert>;
        } else if (!isLoaded) {
            return <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>;
        } else {
            const doneImages = this.state.images.length === this.state.upload.convertedFiles.length;
            return results.map(result => 
                <OCRResultReviewCard result={result} 
                    image={doneImages ? this.state.images[result.rect.page] : null}
                    onSave={this.handleSave} onSelect={()=>{}} className="mb-2" />);
        }
    }

    render() {
        return (
            <>
                <Button size="sm" 
                    variant="outline-primary" 
                    className="mb-2"
                    onClick={this.onOpenPinnedOCRClick}>Pinned OCRs</Button>

                <Offcanvas placement="end"
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