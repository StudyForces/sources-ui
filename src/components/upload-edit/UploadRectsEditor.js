import React, {Component} from 'react';
import {Button, Spinner, Card, Row, Col, ButtonGroup} from 'react-bootstrap';
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

    addRectToUpload() {
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
            type: "TEXT",
            status: null
        }

        const upload = this.state.upload;
        upload.rects.push(rect);

        this.setState({upload: upload, crop: null});
        this.convertExistingRectsToImages();
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

    render() {
        return (
            <Row cols={2} md style={{marginBottom: '10px'}}>
                <Col sm className="text-center">
                    <div>
                        {
                            this.state.image === null ? <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner> : null
                        }
                    </div>
                    <ReactCrop
                        src={this.state.src}
                        crop={this.state.crop}
                        onChange={this.handleCropChange}>
                        <img
                            id="source"
                            onLoad={this.handleImageChange}
                            src={this.state.src}
                            alt="Source image"/>
                    </ReactCrop>
                </Col>
                <Col sm className="text-center">
                    <Button variant="primary"
                            size="sm"
                            className="mb-3 me-2"
                            onClick={this.addRectToUpload}
                            disabled={this.state.crop === null || this.state.image === null}>
                        Add text rect
                    </Button>
                    <ButtonGroup size="sm"
                                 className="mb-3">
                        <Button variant="outline-primary"
                                onClick={this.saveUploadAndOCR}>
                            Save {this.state.existingRects.length} region(s) and OCR
                        </Button>
                        <Button variant="outline-secondary"
                                onClick={this.saveUpload}>
                            Save {this.state.existingRects.length} region(s)
                        </Button>
                    </ButtonGroup>
                    <div className="overflow-scroll" style={{height: '70vh'}}>
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
                                            (this.state.upload.rects[index] !== undefined &&
                                                this.state.upload.rects[index].type === "TEXT" &&
                                                this.state.upload.rects[index].data !== undefined) ?
                                                (<code>{this.state.upload.rects[index].data.text}</code>) : null
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
        )
    }
}

export default UploadRectsEditor;
