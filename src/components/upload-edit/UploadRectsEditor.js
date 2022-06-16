import React, {Component} from 'react';
import {Button, Spinner, Card, Row, Col, ButtonGroup} from 'react-bootstrap';
import Latex from 'react-latex';
import ReactCrop from 'react-image-crop';
import {config} from "../../Constants";
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
            existingRects: []
        }

        this.handleCropChange = this.handleCropChange.bind(this);
        this.handleImageChange = this.handleImageChange.bind(this);
        this.handleDeleteRect = this.handleDeleteRect.bind(this);
        this.addRectToUpload = this.addRectToUpload.bind(this);

        this.convertExistingRectsToImages = this.convertExistingRectsToImages.bind(this);
        this.cropImage = this.cropImage.bind(this);

        this.saveUpload = this.saveUpload.bind(this);
        this.saveUploadAndOCR = this.saveUploadAndOCR.bind(this);
    }

    componentDidMount() {
        this.setState({src: `${config.url.API_BASE_URL}/upload/view/${this.state.upload.id}`});
    }

    handleCropChange(event) {
        if (this.state.image === null) {
            return;
        }

        this.setState({crop: event});
    }

    handleImageChange(event) {
        event.target.crossOrigin = 'anonymous';
        this.setState({image: event.target});
        this.convertExistingRectsToImages();
    }

    handleDeleteRect = (index) => {
        const upload = this.state.upload;
        upload.rects.splice(index, 1);
        this.setState({upload: upload});

        const existingRects = this.state.existingRects;
        existingRects.splice(index, 1);
        this.setState({existingRects: existingRects});
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
                type,
                status: null
            }

            const upload = this.state.upload;
            upload.rects.push(rect);

            this.setState({upload: upload, crop: null});
            this.convertExistingRectsToImages();
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
        this.setState({existingRects: this.state.upload.rects.map((rect) => this.cropImage(rect))});
    }

    saveUpload() {
        API.sourceUploads.update(this.state.upload.id, this.state.upload)
            .then(r => this.props.history.push(`/uploads`));
    }

    saveUploadAndOCR() {
        API.sourceUploads.update(this.state.upload.id, this.state.upload)
            .then(r => API.ocr.request(r.id))
            .then(_ => this.props.history.push(`/uploads`));
    }

    rectContent(rect) {
        if (rect.data === null || rect.data === undefined) {
            return null;
        }

        switch (rect.type) {
            case "TEXT":
                return <code>{rect.data.text}</code>
            case "FORMULA":
                return <Latex children={`$${rect.data.latex}$`}></Latex>
            default:
                return <code>UNKNOWN TYPE: {rect.type}</code>
        }
    }

    render() {
        return (
            <>
                <Row cols={2} md style={{maxHeight: '600px'}}>
                    <Col sm className="text-center"
                         style={{maxHeight: 'inherit'}}>
                        <ReactCrop
                            src={this.state.src}
                            crop={this.state.crop}
                            onChange={this.handleCropChange}
                            style={{maxHeight: 'inherit'}}>
                            <img
                                id="source"
                                onLoad={this.handleImageChange}
                                src={this.state.src}
                                alt="Source image"/>
                        </ReactCrop>
                    </Col>
                    <Col sm className="text-center"
                         style={{maxHeight: 'inherit'}}>
                        <div className="overflow-scroll position-relative" style={{maxHeight: 'inherit'}}>
                            <div className="text-center sticky-top bg-white">
                                {
                                    this.state.image === null ?
                                        <Spinner animation="border" role="status" className="mx-3">
                                            <span className="visually-hidden">Loading...</span>
                                        </Spinner> : null
                                }
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
                                            onClick={this.saveUploadAndOCR}>
                                        Save and OCR
                                    </Button>
                                    <Button variant="outline-secondary"
                                            onClick={this.saveUpload}>
                                        Save
                                    </Button>
                                </ButtonGroup>
                            </div>
                            {
                                this.state.existingRects.map((rect, index) =>
                                    <Card
                                        key={index}
                                        style={{marginBottom: "10px"}}>
                                        <Card.Body className='text-center'>
                                            <img src={rect}
                                                 style={{width: "100%"}}
                                                 alt="Rect"/>
                                            {
                                                this.state.upload.rects[index] !== undefined ?
                                                    this.rectContent(this.state.upload.rects[index]) : null
                                            }
                                        </Card.Body>
                                        <Card.Footer className="text-muted">
                                            <Button
                                                variant="outline-danger"
                                                onClick={() => this.handleDeleteRect(index)}
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
