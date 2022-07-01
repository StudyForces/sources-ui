import React, {Component} from 'react';
import {Button, Spinner, Card, Row, Col, ButtonGroup} from 'react-bootstrap';
import cropImage from '../helpers/cropImage'
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import API from "../../api";
import PaginationComponent from '../misc/PaginationComponent';
import UploadFileModal from './UploadFileModal';

class UploadRectsEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            upload: this.props.upload,
            image: null,
            crop: null,
            results: [],
            existingRects: [],
            rectsShow: [],
            rectsShowMethod: "all",
            currentPage: 0,
            pagesBlobs: [],
            showUploadFileModal: false
        }

        this.handleCropChange = this.handleCropChange.bind(this);
        this.handleImageChange = this.handleImageChange.bind(this);
        this.handleDeleteResult = this.handleDeleteResult.bind(this);
        this.addRectToUpload = this.addRectToUpload.bind(this);

        this.convertExistingRectsToImages = this.convertExistingRectsToImages.bind(this);
        this.cropImage = this.cropImage.bind(this);

        this.save = this.save.bind(this);
        this.saveAndOCR = this.saveAndOCR.bind(this);

        this.loadResults = this.loadResults.bind(this);
        this.loadPagesBlobs = this.loadPagesBlobs.bind(this);
        this.setPage = this.setPage.bind(this);

        this.showAllRects = this.showAllRects.bind(this);
        this.showCurrentPageRects = this.showCurrentPageRects.bind(this);

        this.onOpenUploadFileClick = this.onOpenUploadFileClick.bind(this);
        this.onCloseUploadFileClick = this.onCloseUploadFileClick.bind(this);
    }

    componentDidMount() {
        this.loadResults();
        this.loadPagesBlobs();
    }

    componentWillUnmount() {
        this.state.pagesBlobs.forEach(url => URL.revokeObjectURL(url));
    }

    loadResults() {
        API.uploads.getOCRResults(this.state.upload.id)
            .then(results => {
                this.setState({
                    results
                });
            });
    }

    loadPagesBlobs() {
        const upload = this.state.upload;

        let counter = 0;
        let pagesBlobs = Array.from({length: upload.convertedFiles.length});

        const updState = (id, image) => {
            pagesBlobs[id] = image;
            counter++;
            if (counter === upload.convertedFiles.length) {
                this.setState({pagesBlobs});
            }
        };

        Promise.all(upload.convertedFiles.map(file => API.files.view(file.file)))
            .then(
                (results) => {
                    results.forEach((result, id) => {
                        const imageUrl = URL.createObjectURL(result);
                        const image = new Image();
                        image.src = imageUrl;
                        image.onload = () => {
                            updState(id, image);
                        }
                    })
                },
                (error) => {
                    this.state.pagesBlobs.forEach(image => {
                        URL.revokeObjectURL(image.src);
                    });
                    this.setState({
                        pagesBlobs: [],
                    });
                }
            );
    }

    setPage(page) {
        this.setState({image: null, currentPage: page - 1});
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
        const rectId = this.state.rectsShow[index].id;

        const results = this.state.results;
        const result = results[rectId];
        results.splice(rectId, 1);

        const existingRects = this.state.existingRects;
        existingRects.splice(rectId, 1);

        this.setState({results, existingRects}, () => {
            if (result.id !== undefined) {
                API.ocr.remove(result.id).then();
            }
        });
        this.showAllRects();
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
        const sourceImage = this.state.pagesBlobs[crop.page];
        return cropImage(sourceImage, crop).toDataURL();
    }

    convertExistingRectsToImages() {
        const existingRects = [];
        this.state.results.forEach((result) => {
            const rectSrc = this.cropImage(result.rect);
            const rect = {
                page: result.rect.page,
                src: rectSrc
            }

            existingRects.push(rect);
        })

        this.setState({existingRects}, () => {
            switch (this.state.rectsShowMethod) {
                case "all":
                    this.showAllRects();
                    break;
                case "current_page":
                    this.showCurrentPageRects();
                    break;
                default:
                    this.showAllRects();
                    break;
            }
        });
    }

    showAllRects() {
        this.setState({rectsShowMethod: "all"});
        this.setState({rectsShow: []}, () => {
            const rectsShow = [];

            this.state.existingRects.map((rect, index) => rectsShow.push({
                id: index,
                src: rect.src
            }));

            this.setState({rectsShow});
        });

    }

    showCurrentPageRects() {
        this.setState({rectsShowMethod: "current_page"});
        this.setState({rectsShow: []}, () => {
            const rectsShow = [];

            this.state.existingRects.map((rect, index) => {
                if (rect.page === this.state.currentPage) {
                    rectsShow.push({
                        id: index,
                        src: rect.src
                    });
                }
            });

            this.setState({rectsShow});
        });
    }

    save() {
        API.uploads.saveOCRResults(this.state.upload, this.state.results)
            .then(r => this.props.history.push(`/uploads`));
    }

    saveAndOCR() {
        API.uploads.saveOCRResults(this.state.upload, this.state.results)
            .then(r => API.ocr.request(this.state.upload.id))
            .then(_ => this.props.history.push(`/uploads`));
    }

    onOpenUploadFileClick = () => this.setState({showUploadFileModal:true});
    onCloseUploadFileClick = () => this.setState({showUploadFileModal:false});

    render() {
        return (
            <>
                <UploadFileModal 
                    showModal={this.state.showUploadFileModal} 
                    closeModal={this.onCloseUploadFileClick} />
                
                <Row cols={2} md>
                    <Col sm className="overflow-scroll" style={{height: 'calc(100vh - 56px)'}}>
                        <div className="sticky-top py-3 bg-white-blurred" style={{zIndex: 100}}>
                            <h1>Edit Upload #{this.props.match.params.id}</h1>
                        </div>
                        {
                            this.state.pagesBlobs[this.state.currentPage] !== undefined ?
                                <>
                                    <ReactCrop
                                        crop={this.state.crop}
                                        onChange={this.handleCropChange}
                                        style={{maxHeight: 'inherit'}}>
                                        <img
                                            onLoad={this.handleImageChange}
                                            src={this.state.pagesBlobs[this.state.currentPage].src}
                                            alt="Source image"
                                            className="text-center"/>
                                    </ReactCrop>

                                </>
                                : <Spinner animation="border" role="status" className="mx-3">
                                    <span className="visually-hidden">Loading...</span>
                                </Spinner>
                        }
                        <div className="sticky-bottom py-1 center mx-auto bg-white-blurred d-flex justify-content-center"
                            style={{zIndex: 100}}>
                            <PaginationComponent
                                currentPage={this.state.currentPage + 1}
                                itemsCount={this.state.upload.convertedFiles.length}
                                itemsPerPage={1}
                                setCurrentPage={this.setPage}/>
                        </div>
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
                                <Button variant="primary"
                                        onClick={this.addRectToUpload("PICTURE")}
                                        disabled={this.state.crop === null || this.state.image === null}>
                                    Picture
                                </Button>
                            </ButtonGroup>
                            <ButtonGroup size="sm"
                                        className="mb-3 me-2">
                                <Button variant="outline-primary"
                                        onClick={this.saveAndOCR}>
                                    Save and OCR
                                </Button>
                                <Button variant="outline-secondary"
                                        onClick={this.save}>
                                    Save
                                </Button>
                            </ButtonGroup>
                            <ButtonGroup size="sm"
                                        className="mb-3 me-2">
                                <Button variant="outline-secondary"
                                        onClick={this.showAllRects}
                                        disabled={this.state.rectsShowMethod === "all"}>
                                    All
                                </Button>
                                <Button variant="outline-secondary"
                                        onClick={this.showCurrentPageRects}
                                        disabled={this.state.rectsShowMethod === "current_page"}>
                                    This page
                                </Button>
                            </ButtonGroup>
                            <Button size="sm"
                                    className="mb-3" 
                                    variant="outline-success"
                                    onClick={this.onOpenUploadFileClick} >
                                Add file
                            </Button>
                        </div>
                        {
                            this.state.rectsShow.map((rect, index) =>
                                <Card
                                    key={index}
                                    className="mb-2">
                                    <Card.Body className='text-center'>
                                        <img src={rect.src}
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
            </>
        )
    }
}

export default UploadRectsEditor;
