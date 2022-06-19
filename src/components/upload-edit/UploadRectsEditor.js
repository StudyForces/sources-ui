import React, {Component} from 'react';
import {Button, Spinner, Card, Row, Col, ButtonGroup} from 'react-bootstrap';
import Latex from 'react-latex';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import API from "../../api";

class UploadRectsEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            upload: this.props.upload,
            src: null,
            image: null,
            crop: null,
            results: [],
            existingRects: []
        }

        this.handleCropChange = this.handleCropChange.bind(this);
        this.handleImageChange = this.handleImageChange.bind(this);
        this.handleDeleteResult = this.handleDeleteResult.bind(this);
        this.addRectToUpload = this.addRectToUpload.bind(this);

        this.convertExistingRectsToImages = this.convertExistingRectsToImages.bind(this);
        this.cropImage = this.cropImage.bind(this);

        this.save = this.save.bind(this);
        this.saveAndOCR = this.saveAndOCR.bind(this);
    }

    componentDidMount() {
        Promise.all([API.sourceUploads.getImage(this.state.upload.id),
            API.sourceUploads.getOCRResults(this.state.upload.id)])
            .then(res => {
                this.setState({
                    src: URL.createObjectURL(res[0]),
                    results: res[1].content
                });
            });
    }

    componentWillUnmount() {
        URL.revokeObjectURL(this.state.src)
    }

    handleCropChange(event) {
        if (this.state.image === null) {
            return;
        }

        this.setState({crop: event});
    }

    handleImageChange(event) {
        this.setState({image: event.target}, () => {
            this.convertExistingRectsToImages();
        })
    }

    handleDeleteResult = (index) => {
        const results = this.state.results;
        results.splice(index, 1);

        const existingRects = this.state.existingRects;
        existingRects.splice(index, 1);

        this.setState({results, existingRects});
    }

    addRectToUpload(type) {
        return () => {
            if (this.state.image === null) {
                return;
            }

            const sourceImage = this.state.image;

            const scaleX = sourceImage.naturalWidth / sourceImage.width;
            const scaleY = sourceImage.naturalHeight / sourceImage.height;

            const rect = {
                x: this.state.crop.x * scaleX,
                y: this.state.crop.y * scaleY,
                width: this.state.crop.width * scaleX,
                height: this.state.crop.height * scaleY,
            }

            const results = this.state.results;
            results.push({
                rect,
                type,
                status: null
            });

            this.setState({results, crop: null}, () => {
                this.convertExistingRectsToImages();
            });
        }
    }

    cropImage(crop) {
        if (this.state.image === null) {
            return;
        }

        const canvas = document.createElement('canvas');
        const sourceImage = this.state.image;

        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');

        const pixelRatio = window.devicePixelRatio;
        canvas.width = crop.width * pixelRatio;
        canvas.height = crop.height * pixelRatio;
        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
            sourceImage,
            crop.x,
            crop.y,
            crop.width,
            crop.height,
            0,
            0,
            crop.width,
            crop.height,
        );

        return canvas.toDataURL();
    }

    convertExistingRectsToImages() {
        this.setState({existingRects: this.state.results.map((result) => this.cropImage(result.rect))});
    }

    save() {
        API.sourceUploads.saveOCRResults(this.state.upload, this.state.results)
            .then(r => this.props.history.push(`/uploads`));
    }

    saveAndOCR() {
        API.sourceUploads.saveOCRResults(this.state.upload, this.state.results)
            .then(r => API.ocr.request(this.state.upload.id))
            .then(_ => this.props.history.push(`/uploads`));
    }

    render() {
        return (
            <>
                <Row cols={2} md style={{maxHeight: '600px'}}>
                    <Col sm className="text-center"
                         style={{maxHeight: 'inherit'}}>
                        {
                            this.state.src !== null ? <ReactCrop
                                src={this.state.src}
                                crop={this.state.crop}
                                onChange={this.handleCropChange}
                                style={{maxHeight: 'inherit'}}>
                                <img
                                    onLoad={this.handleImageChange}
                                    src={this.state.src}
                                    alt="Source image"/>
                            </ReactCrop> : <Spinner animation="border" role="status" className="mx-3">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        }
                    </Col>
                    <Col sm className="text-center"
                         style={{maxHeight: 'inherit'}}>
                        <div className="overflow-scroll position-relative" style={{maxHeight: 'inherit'}}>
                            <div className="text-center sticky-top bg-white" style={{zIndex: 100}}>
                                <ButtonGroup size="sm"
                                             className="mb-3 me-2">
                                    <Button variant="primary"
                                            onClick={this.addRectToUpload("TEXT")}
                                            disabled={this.state.crop === null || this.state.image === null}>
                                        Text
                                    </Button>
                                    <Button variant="primary"
                                            onClick={this.addRectToUpload("FORMULA")}
                                            disabled={this.state.crop === null || this.state.image === null}>
                                        Formula
                                    </Button>
                                </ButtonGroup>
                                <ButtonGroup size="sm"
                                             className="mb-3">
                                    <Button variant="outline-primary"
                                            onClick={this.saveAndOCR}>
                                        Save and OCR
                                    </Button>
                                    <Button variant="outline-secondary"
                                            onClick={this.save}>
                                        Save
                                    </Button>
                                </ButtonGroup>
                            </div>
                            {
                                this.state.existingRects.map((rect, index) =>
                                    <Card
                                        key={index}
                                        className="mb-2">
                                        <Card.Body className='text-center'>
                                            <img src={rect}
                                                 style={{width: "100%"}}
                                                 alt="Rect"/>
                                        </Card.Body>
                                        <Card.Footer className="text-muted">
                                            <Button
                                                variant="outline-danger"
                                                onClick={() => this.handleDeleteResult(index)}
                                                size="sm">
                                                Delete rect
                                            </Button>
                                        </Card.Footer>
                                    </Card>
                                )
                            }
                        </div>
                    </Col>
                </Row>
            </>
        )
    }
}

export default UploadRectsEditor;
