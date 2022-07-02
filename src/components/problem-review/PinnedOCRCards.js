import React, {Component} from 'react';
import { Button, Offcanvas } from 'react-bootstrap';

class PinnedOCRCards extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showPinnedOCR: false
        }

        this.onOpenPinnedOCRClick = this.onOpenPinnedOCRClick.bind(this);
        this.onClosePinnedOCRClick = this.onClosePinnedOCRClick.bind(this);
    }

    onOpenPinnedOCRClick() {
        this.setState({showPinnedOCR: true});
    }

    onClosePinnedOCRClick() {
        this.setState({showPinnedOCR: false});
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
                        Some text as placeholder. In real life you can have the elements you
                        have chosen. Like, text, images, lists, etc.
                    </Offcanvas.Body>
                </Offcanvas>
            </>
        )
    }
}

export default PinnedOCRCards;