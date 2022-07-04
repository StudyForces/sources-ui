import React, {Component} from 'react';
import {Dropdown, Form, Offcanvas, Spinner, Col, Row, Button} from "react-bootstrap";
import {NavLink} from "react-router-dom";
import Latex from '../misc/Latex';

class ProblemPinner extends Component {
    constructor(props) {
        super(props);

        this.state = {
            search: "",
            problems: [],
            problemsShow: [],
            offcanvasProblem: null,
            showProblem: false,
            error: null
        }

        this.getShowProblems = this.getShowProblems.bind(this);
        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.menuContent = this.menuContent.bind(this);
        this.offcanvas= this.offcanvas.bind(this);
        this.onOpenProblemClick = this.onOpenProblemClick.bind(this);
        this.onCloseProblemClick = this.onCloseProblemClick.bind(this);
    }

    componentDidMount() {
        this.setState({problems: this.props.problems,
            problemError: this.props.problemError}, 
            () => this.getShowProblems());
    }

    handleSearchChange(e) {
        this.setState({search: e.target.value}, () => this.getShowProblems());
    }

    onOpenProblemClick(problem) {
        console.log(problem);
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

    offcanvas() {
        const {offcanvasProblem, showProblem} = this.state;
        
        if(offcanvasProblem){
            return(
                <Offcanvas show={showProblem} style={{width: "45%"}} 
                    onHide={this.onCloseProblemClick} placement="end">
                    <Offcanvas.Header>
                        <Row className="align-items-center mb-1" style={{width: "100%"}} sm={2}>
                            <Col>
                                <Offcanvas.Title>Problem #{offcanvasProblem.id}</Offcanvas.Title>
                            </Col>
                            <Col className="text-end">
                                <Button variant="outline-primary">
                                        Pin
                                </Button>
                            </Col>
                        </Row>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        <Latex children={offcanvasProblem.problem} />
                    </Offcanvas.Body>
                </Offcanvas>
            )
        } else {
            return(
                <Offcanvas show={showProblem} onHide={this.onCloseProblemClick}>
                    <Spinner animation="border" role="status" size="sm">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </Offcanvas>
            )
        }
        
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
                {this.offcanvas()}
            </Dropdown>
        )
    }
}

export default ProblemPinner;