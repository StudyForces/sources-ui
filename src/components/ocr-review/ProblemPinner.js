import React, {Component} from 'react';
import {Dropdown, Form, Offcanvas, Spinner, Col, Row, Button, Modal} from "react-bootstrap";
import API from "../../api";
import ReactKatex from "@pkasila/react-katex";

class ProblemSearchDropdown extends Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
            search: "",
            searching: false,
            problems: []
        }

        this.menuContent = this.menuContent.bind(this);
        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.getProblems = this.getProblems.bind(this);
    }

    componentDidMount() {
        this.getProblems();
    }

    handleSearchChange(e) {
        this.setState({search: e.target.value}, () => this.getProblems());
    }

    getProblems() {
        const {search} = this.state;

        this.setState({searching: true});
        API.problems.search(search, 0, 20)
            .then(
                (result) => this.setState({problems: result.content, searching: false}),
                (error) => this.setState({error, problems: [], searching: false})
            )
    }

    menuContent() {
        const {error, problems, searching} = this.state;

        if(error){
            return (<Dropdown.Item className="text-center" disabled={true}>
                        Error: {error.message}
                    </Dropdown.Item>);
        } else if(searching) {
            return (<Dropdown.Item className="text-center" disabled={true}>
                        <Spinner animation="border" role="status" size="sm" className="me-2" />
                        Searching...
                    </Dropdown.Item>);
        } else if(problems.length === 0) {
            return (<Dropdown.Item className="text-center" disabled={true}>
                        Nothing was found
                    </Dropdown.Item>);
        } else {
            return(
                problems.map((problem, index) => 
                    <Dropdown.Item key={index} onClick={() => this.props.onOpenProblemClick(problem)}>
                        {problem.id}
                    </Dropdown.Item>
                )
            )
        }
    }

    render() {
        return(
            <>
                <Dropdown align="end">
                    <Dropdown.Toggle style={{cursor: "pointer"}} as={"a"}>Pin problem</Dropdown.Toggle>
                    <Dropdown.Menu>
                        <div className="mb-1">
                            <Form className="mb-1">
                                <Form.Control
                                    style={{width: "max-content"}}
                                    onChange={this.handleSearchChange}
                                    placeholder="Enter problem ID" />
                            </Form>
                        </div>
                        <Dropdown.Divider />
                        <div className="overflow-scroll"  style={{height: "250px"}}>
                            {this.menuContent()}
                        </div>

                    </Dropdown.Menu>
                </Dropdown>

                
            </>
        )
    }

    // getShowProblems() {
    //     const {problems, search} = this.state;

    //     this.setState({problemsShow: []}, () => {
    //         const problemsShow = [];
    //         problems.forEach((problem) => {
    //             if(problem.id.toString().includes(search)) {
    //                 problemsShow.push(problem);
    //             }
    //         })

    //         this.setState({problemsShow});
    //     });
    // }
}

class ProblemPinner extends Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
            offcanvasProblem: {},
            showProblem: false,
            ocr: props.ocr,
            pinning: false,
            showErrorPinningModal: false
        }

        this.offcanvas= this.offcanvas.bind(this);
        this.onOpenProblemClick = this.onOpenProblemClick.bind(this);
        this.onCloseProblemClick = this.onCloseProblemClick.bind(this);
        this.pinOCR = this.pinOCR.bind(this);
        this.checkOCRBeforePinning = this.checkOCRBeforePinning.bind(this);
        this.onOpenErrorPinningModal = this.onOpenErrorPinningModal.bind(this);
        this.onCloseErrorPinningModal = this.onCloseErrorPinningModal.bind(this);
        this.errorPinningModal = this.errorPinningModal.bind(this);
    }

    onOpenProblemClick(problem) {
        this.setState({offcanvasProblem: problem, showProblem: true});
    }

    onCloseProblemClick() {
        this.setState({showProblem: false});
    }

    onOpenErrorPinningModal() {
        this.setState({showErrorPinningModal: true});
    }

    onCloseErrorPinningModal() {
        this.setState({showErrorPinningModal: false});
    }

    checkOCRBeforePinning() {
        const {offcanvasProblem} = this.state;

        this.setState({pinning: true});

        API.problems.getOCRResults(offcanvasProblem.id)
            .then(
                (result) => {
                    const results = result;
                    if(results.length === 0) {
                        this.pinOCR();
                    } else {
                        API.ocr.getUpload(results[0].id)
                            .then(
                                (r) => {
                                    if(r.id === this.props.upload.id) {
                                        this.pinOCR();
                                    } else {
                                        this.setState({pinning: false}, 
                                            this.onOpenErrorPinningModal());
                                    }
                                },
                                (error) => {
                                    this.setState({error, pinning: false}, 
                                        this.onOpenErrorPinningModal());
                                }
                            )
                    }
                }, 
                (error) => {
                    this.setState({error, pinning: false}, 
                        this.onOpenErrorPinningModal());
                }
            )
    }

    pinOCR() {
        const {offcanvasProblem, ocr} = this.state;

        let problem = offcanvasProblem;
        problem = {...problem, ocrResults: [ocr]};
        API.problems.update(problem.id, problem)
            .then((result) => {
                this.onCloseProblemClick();
                this.props.getProblem();
                this.setState({pinning: false});
            });
    }

    errorPinningModal() {
        const {showErrorPinningModal, error, offcanvasProblem} = this.state;

        return(
            <Modal show={showErrorPinningModal} 
                onHide={this.onCloseErrorPinningModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Error with pinning</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error ? `Error: ${error.message}` 
                        : `If you want to pin OCR from 
                            Upload #${this.props.upload.id}, you must unpin 
                            all other upload\`s OCRs from Problem #${offcanvasProblem.id}`}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={this.onCloseErrorPinningModal}>
                        Ok
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }

    offcanvas() {
        const {offcanvasProblem, showProblem} = this.state;
        
        return(
            <Offcanvas show={showProblem} style={{width: "45%"}} 
                onHide={this.onCloseProblemClick} placement="end">
                <Offcanvas.Header>
                    <Row className="align-items-center mb-1" style={{width: "100%"}} sm={2}>
                        <Col>
                            <Offcanvas.Title>Problem #{offcanvasProblem.id}</Offcanvas.Title>
                        </Col>
                        <Col className="text-end">
                            <Button disabled={this.state.pinning} 
                                variant="outline-primary"
                                onClick={!this.state.pinning ? this.checkOCRBeforePinning : null}>
                                {!this.state.pinning ? 'Pin' : <>
                                    <Spinner animation="border" role="status" size="sm" className="me-2" />
                                    Loading...
                                </>}
                            </Button>
                        </Col>
                    </Row>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <ReactKatex output={'mathml'} children={offcanvasProblem.problem} />
                </Offcanvas.Body>
            </Offcanvas>
        )
    }

    render() {
        return(
            <>
                <ProblemSearchDropdown 
                    onOpenProblemClick={this.onOpenProblemClick} />
                
                {this.offcanvas()}
                {this.errorPinningModal()}
            </>
        )
    }
}

export default ProblemPinner;