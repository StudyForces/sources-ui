import React, { Component } from 'react';
import {Button, Card, Col, Form, Row, Spinner} from "react-bootstrap";
import Latex from "../misc/Latex";

class ProblemForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            problem: null,
            solution: null,
            addSolution: null,
            submitting: false
        }

        this.submit = this.submit.bind(this);
    }

    static getDerivedStateFromProps(props, state) {
        const { problem } = props;

        let obj = {
            selected: props.selected,
            submitting: props.submitting
        };

        if (problem !== undefined) {
            obj.problem = state.problem || problem.problem;
            obj.solution = state.solution || problem.solution || '';
            if ((obj.solution !== '' && obj.solution !== null) && state.addSolution === null) {
                obj.addSolution = true;
            } else if (state.addSolution === null) {
                obj.addSolution = false;
            }
        } else {
            obj.problem = state.problem || '';
            obj.solution = state.solution || '';
        }

        if (obj.selected.length === 1 && state.problem === '' && obj.selected[0].type === 'TEXT') {
            obj.problem = obj.selected[0].data.text;
        }

        return obj;
    }

    submit() {
        this.props.onSubmit({
            type: 'STATIC',
            problem: this.state.problem,
            solution: this.state.addSolution ? this.state.solution : null
        }, () => {
            const s = {
                problem: '',
                solution: '',
                submitting: false
            };
            if (this.props.problem !== undefined) {
                s.addSolution = this.props.problem.solution !== '' && this.props.problem.solution !== null;
            }
            this.setState(s);
        });
    }

    render() {
        return <Row xs={1} className="g-4 mb-4">
            <Col>
                <Card>
                    <Card.Header>Problem</Card.Header>
                    <Card.Body>
                        <h6>Problem Type</h6>
                        <div>
                            <Form.Check
                                inline
                                label="Static"
                                value="STATIC"
                                name="problemType"
                                type="radio"
                                defaultChecked={true}
                            />
                        </div>
                        <h6 className="mt-2">Preview</h6>
                        <div className="my-2">
                            <Latex children={this.state.problem}></Latex>
                        </div>
                        <Form.Group controlId="taskSubmission.problemLatex">
                            <Form.Label as={"h6"}>LaTeX</Form.Label>
                            <Form.Control as="textarea" rows={3} value={this.state.problem}
                                          onChange={(event) => {
                                              this.setState({problem: event.target.value});
                                          }} />
                        </Form.Group>
                    </Card.Body>
                </Card>
            </Col>
            <Col>
                <Card>
                    <Card.Header>
                        <Row className="m-0 p-0">
                            <Col className="m-0 p-0">
                                Solution
                            </Col>
                            <Col md="auto" className="m-0 p-0">
                                <Form.Check type="checkbox" checked={this.state.addSolution}
                                            onChange={(e) => this.setState({addSolution: e.target.checked})} />
                            </Col>
                        </Row>
                    </Card.Header>
                    {
                        this.state.addSolution ? <Card.Body>
                            <h6>Preview</h6>
                            <div className="my-2">
                                <Latex displayMode={true} children={this.state.solution}></Latex>
                            </div>
                            <Form.Group controlId="taskSubmission.solutionLatex">
                                <Form.Label as={"h6"}>LaTeX</Form.Label>
                                <Form.Control as="textarea" rows={3} defaultValue={this.state.solution}
                                              onChange={(event) => {
                                                  this.setState({solution: event.target.value});
                                              }} />
                            </Form.Group>
                        </Card.Body> : null
                    }
                </Card>
            </Col>
            <Col>
                <Button variant="primary" disabled={this.state.submitting}
                        onClick={!this.state.submitting ? this.submit : null}>
                    { !this.state.submitting ? 'Save' : <>
                        <Spinner animation="border" role="status" size="sm" className="me-2"></Spinner>
                        Loading...
                    </> }
                </Button>
            </Col>
        </Row>;
    }
}

export default ProblemForm;
