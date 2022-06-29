import React, {Component} from 'react';
import {Button, Spinner, Card, Row, Col, ButtonGroup} from 'react-bootstrap';
import cropImage from '../helpers/cropImage'
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import API from "../../api";
import PaginationComponent from '../misc/PaginationComponent';

class UploadRectsEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            upload: this.props.upload,
            src: null,
            image: null,
            crop: null,
            results: [],
            existingRects: [],
            currentPage: 0,
            pagesBlobs: [],
        }

        this.handleCropChange = this.handleCropChange.bind(this);
        this.handleImageChange = this.handleImageChange.bind(this);
        this.handleDeleteResult = this.handleDeleteResult.bind(this);
        this.addRectToUpload = this.addRectToUpload.bind(this);

        this.convertExistingRectsToImages = this.convertExistingRectsToImages.bind(this);
        this.cropImage = this.cropImage.bind(this);

        this.save = this.save.bind(this);
        this.saveAndOCR = this.saveAndOCR.bind(this);

        this.loadPageBlobs = this.loadPageBlobs.bind(this);
        this.loadPage = this.loadPage.bind(this);
        this.setPage = this.setPage.bind(this);
    }

    componentDidMount() {
        this.loadPageBlobs();
        this.loadPage();
    }

    componentWillUnmount() {
        URL.revokeObjectURL(this.state.src)
    }

    loadPageBlobs() {
        const upload = this.state.upload;

        let counter = 0;
        let pagesBlobs = Array.from({length: upload.convertedFiles.length});

        const updState = (id, blob) => {
            pagesBlobs[id] = blob;
            counter++;
            if (counter === upload.convertedFiles.length) {
                this.setState({pagesBlobs});
            }
        };

        Promise.all(upload.convertedFiles.map(file => API.uploads.view(file.file)))
            .then(
                (results) => {
                    results.forEach((result, id) => {
                        const blobUrl = URL.createObjectURL(result);
                        const blob = new Image();
                        blob.src = blobUrl;
                        blob.onload = () => {
                            updState(id, blob);
                        }
                    })
                }
            );
    }

    loadPage() {
        console.log(this.state.upload);
        Promise.all([API.uploads.view(this.state.upload.convertedFiles[this.state.currentPage].file),
            API.sourceUploads.getOCRResults(this.state.upload.id)])
            .then(res => {
                this.setState({
                    src: URL.createObjectURL(res[0]),
                    results: res[1].content
                });
            });
    }

    setPage(page) {
        this.setState({ currentPage: page - 1 }, () => { this.loadPage() });
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

    handleDeleteResult(index) {
        const results = this.state.results;
        const result = results[index];
        results.splice(index, 1);

        const existingRects = this.state.existingRects;
        existingRects.splice(index, 1);

        this.setState({results, existingRects}, () => {
            if (result.id !== undefined) {
                API.ocr.remove(result.id).then();
            }
        });
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
                page: this.state.currentPage,
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

        const sourceImage = this.state.pagesBlobs[crop.page];

        return cropImage(sourceImage, crop).toDataURL();
    }

    convertExistingRectsToImages() {
        this.setState({existingRects: this.state.results.map((result) => this.cropImage(result.rect))});
    }

    save() {
        //console.log(this.state.upload);
        console.log(this.state.results);
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
            <Row cols={2} md>
                <Col sm className="overflow-scroll" style={{height: 'calc(100vh - 56px)'}}>
                    <div className="sticky-top py-3 bg-white-blurred" style={{zIndex: 100}}>
                        <h1>Edit Upload #{this.props.match.params.id}</h1>
                    </div>
                    {
                        this.state.src !== null ? 
                        <>
                            <PaginationComponent 
                                currentPage={this.state.currentPage+1}
                                itemsCount={this.state.upload.convertedFiles.length}
                                itemsPerPage={1}
                                setCurrentPage={this.setPage} />
                            <ReactCrop
                                src={this.state.src}
                                crop={this.state.crop}
                                onChange={this.handleCropChange}
                                style={{maxHeight: 'inherit'}}>
                                <img
                                    onLoad={this.handleImageChange}
                                    src={this.state.src}
                                    alt="Source image"
                                    className="text-center" />
                            </ReactCrop>
                            
                        </>
                        : <Spinner animation="border" role="status" className="mx-3">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    }
                </Col>
                <Col sm className="overflow-scroll text-center" style={{height: 'calc(100vh - 56px)'}}>
                    <div className="text-center sticky-top pt-3 bg-white-blurred" style={{zIndex: 100}}>
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
                </Col>
            </Row>
        )
    }
}

export default UploadRectsEditor;
