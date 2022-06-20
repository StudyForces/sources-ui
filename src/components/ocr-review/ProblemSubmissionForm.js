import React, { Component } from 'react';
import {Button, Card, Col, Form, Row} from "react-bootstrap";
import Latex from "react-latex";
import API from "../../api";

class ProblemSubmissionForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selected: [],
            problem: '',
            solution: '',
            addSolution: false,
            submitting: false
        }

        this.submit = this.submit.bind(this);
    }

    static getDerivedStateFromProps(props, state) {
        let obj = {
            selected: props.selected
        };

        if (obj.selected.length === 1 && state.problem === '' && obj.selected[0].type === 'TEXT') {
            obj.problem = obj.selected[0].data.text;
        }

        return obj;
    }

    submit() {
        API.problems.create({
            type: 'STATIC',
            problem: this.state.problem,
            solution: this.state.addSolution ? this.state.solution : null
        }, this.props.selected).then(p => {
            this.props.onSubmit(() => {
                this.setState({
                    selected: [],
                    problem: '',
                    solution: '',
                    addSolution: false,
                    submitting: false
                });
            });
        });
    }

    render() {
        return <>
            <h2>New Problem</h2>
            <Row xs={1} className="g-4 mb-4">
                <Col>
                    <Card>
                        <Card.Header>Problem</Card.Header>
                        <Card.Body>
                            <h6>Related OCRs</h6>
                            Selected OCRs: {this.state.selected.length}
                            <h6 className="mt-2">Problem Type</h6>
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
                                    <Form.Control as="textarea" rows={3} value={this.state.solution}
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
                        { !this.state.submitting ? 'Save' : 'Submitting...' }
                    </Button>
                </Col>
            </Row>
        </>;
    }
}

export default ProblemSubmissionForm;
