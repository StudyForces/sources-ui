import React, {Component} from 'react';
import {Dropdown, Form, Offcanvas, Spinner, Col, Row, Button} from "react-bootstrap";
import API from "../../api";
import ReactKatex from "@pkasila/react-katex";

class ProblemPinner extends Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
            search: "",
            problems: [],
            problemsShow: [],
            offcanvasProblem: {},
            showProblem: false,
            ocr: props.ocr,
            pinning: false
        }

        this.getShowProblems = this.getShowProblems.bind(this);
        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.menuContent = this.menuContent.bind(this);
        this.offcanvas= this.offcanvas.bind(this);
        this.onOpenProblemClick = this.onOpenProblemClick.bind(this);
        this.onCloseProblemClick = this.onCloseProblemClick.bind(this);
        this.pinOCR = this.pinOCR.bind(this);
    }

    componentDidMount() {
        let problems = [];
        if(this.props.problems){
            problems = this.props.problems;
        }

        this.setState({problems,
            problemError: this.props.problemError}, 
            () => this.getShowProblems());
    }

    handleSearchChange(e) {
        this.setState({search: e.target.value}, () => this.getShowProblems());
    }

    onOpenProblemClick(problem) {
        this.setState({offcanvasProblem: problem, showProblem: true});
    }

    onCloseProblemClick() {
        this.setState({showProblem: false});
    }

    getShowProblems() {
        const {problems, search} = this.state;

        this.setState({problemsShow: []}, () => {
            const problemsShow = [];
            problems.forEach((problem) => {
                if(problem.id.toString().includes(search)) {
                    problemsShow.push(problem);
                }
            })

            this.setState({problemsShow});
        });
    }

    pinOCR() {
        const {offcanvasProblem, ocr} = this.state;

        this.setState({pinning: true});

        let problem = offcanvasProblem;
        problem = {...problem, ocrResults: [ocr]};
        API.problems.update(problem.id, problem)
            .then((result) => {
                this.onCloseProblemClick();
                this.props.getProblem();
                this.setState({pinning: false});
            });
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
                                onClick={!this.state.pinning ? this.pinOCR : null}>
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

    menuContent() {
        const {error, problemsShow} = this.state;

        if(error){
            return (<Dropdown.Item className="text-center" disabled={true}>
                        Error: {error.message}
                    </Dropdown.Item>);
        } else if(problemsShow.length === 0) {
            return (<Dropdown.Item className="text-center" disabled={true}>
                        Nothing was found
                    </Dropdown.Item>);
        } else {
            return(
                problemsShow.map((problem, index) => 
                    <Dropdown.Item key={index} onClick={() => this.onOpenProblemClick(problem)}>
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
                    <Dropdown.Toggle  as={"a"}>Pin problem</Dropdown.Toggle>
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

                {this.offcanvas()}
            </>
        )
    }
}

export default ProblemPinner;