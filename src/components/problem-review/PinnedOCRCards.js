import React, {Component} from 'react';
import { Button, Offcanvas, Alert, Spinner, Col } from 'react-bootstrap';
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
            images: []
        }

        this.content = this.content.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.onOpenPinnedOCRClick = this.onOpenPinnedOCRClick.bind(this);
        this.onClosePinnedOCRClick = this.onClosePinnedOCRClick.bind(this);
    }

    componentDidMount() {
        const _OCRCardsInfo = new OCRCardsInfo(
            (newState) => this.setState(newState), 
            () => this.state,
            undefined, 
            this.props.problemId,
            "problem_review",);
        _OCRCardsInfo.getOCRCardsInfo()
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
                const { results } = this.state;

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
                <OCRResultReviewCard key={result.id} result={result}
                    image={doneImages ? this.state.images[result.rect.page] : null}
                    onSave={this.handleSave} onSelect={()=>{}} />);
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