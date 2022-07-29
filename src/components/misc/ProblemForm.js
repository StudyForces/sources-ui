import React, {Component} from 'react';
import {Button, Card, Col, Form, Row, Spinner, Stack} from "react-bootstrap";
import EquationInserter from './EquationInserter';
import ProblemAttachmentsForm from "./ProblemAttachmentsForm";
import ReactKatex from "@pkasila/react-katex";
import ProblemSolveForm from './ProblemSolveForm';

const emptySolverMetadata = {
    type: 'FORMULA',
    variants: [],
    correct: null,
    formula: null
};

class ProblemForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            problem: null,
            solution: null,
            solverMetadata: null,
            attachments: null,
            ocrAttachments: [],
            addSolution: null,
            addSolverMetadata: null,
            addAttachments: null,
            submitting: false
        }

        this.submit = this.submit.bind(this);
    }

    static getDerivedStateFromProps(props, state) {
        const {problem} = props;

        let obj = {
            selected: props.selected,
            submitting: props.submitting
        };

        if (problem !== undefined) {
            obj.problem = state.problem || problem.problem;
            obj.solution = state.solution || problem.solution || '';
            obj.solverMetadata = state.solverMetadata || problem.solverMetadata || emptySolverMetadata;
            obj.attachments = state.attachments || problem.attachments || [];
            if ((obj.solution !== '' && obj.solution !== null) && state.addSolution === null) {
                obj.addSolution = true;
            } else if (state.addSolution === null) {
                obj.addSolution = false;
            }
            if (obj.attachments.length > 0 && state.addAttachments === null) {
                obj.addAttachments = true;
            } else if (state.addAttachments === null) {
                obj.addAttachments = false;
            }
            obj.addSolverMetadata=true;
            
        } else {
            obj.problem = state.problem || '';
            obj.solution = state.solution || '';
            obj.solverMetadata = state.solverMetadata || emptySolverMetadata;
            obj.attachments = state.attachments || [];
        }

        if(!obj.solverMetadata.type) {
            obj.solverMetadata.type = 'FORMULA';
        }

        if (obj.selected.length === 1 && state.problem === '' && obj.selected[0].type === 'TEXT') {
            obj.problem = obj.selected[0].data.text;
        }

        obj.ocrAttachments = obj.selected.filter(r => r.type === 'PICTURE');

        if (obj.ocrAttachments.length > 0) {
            obj.addAttachments = state.addAttachments || true;
        }

        return obj;
    }

    submit() {
        console.log(this.state.addSolverMetadata);
        console.log(this.state.solverMetadata);
        this.props.onSubmit({
            type: 'STATIC',
            problem: this.state.problem,
            solution: this.state.addSolution ? this.state.solution : null,
            attachments: this.state.addAttachments ? this.state.attachments : [],
            solverMetadata: this.state.addSolverMetadata ? this.state.solverMetadata : emptySolverMetadata
        }, () => {
            const s = {
                submitting: false
            };
            if (this.props.problem !== undefined) {
                s.addSolution = this.props.problem.solution !== '' && this.props.problem.solution !== null;
                s.addSolverMetadata = this.props.solverMetadata !== null;
                s.addAttachments = this.props.problem.attachments.length > 0;
            } else {
                s.problem = '';
                s.solution = '';
                s.solverMetadata = emptySolverMetadata;
                s.attachments = [];
                s.addSolution = false;
                s.addSolverMetadata = false;
                s.addAttachments = false;
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
                            <ReactKatex strict={false} children={this.state.problem}></ReactKatex>
                        </div>
                        <Form.Group controlId="taskSubmission.problemLatex">
                            <Form.Label as={"h6"}>LaTeX</Form.Label>
                            <EquationInserter />
                            <Form.Control as="textarea" rows={3} value={this.state.problem}
                                          onChange={(event) => {
                                              this.setState({problem: event.target.value});
                                          }}/>
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
                                            onChange={(e) => this.setState({addSolution: e.target.checked})}/>
                            </Col>
                        </Row>
                    </Card.Header>
                    {
                        this.state.addSolution ? <Card.Body>
                            <h6>Preview</h6>
                            <div className="my-2">
                                <ReactKatex strict={false} children={this.state.solution}></ReactKatex>
                            </div>
                            <Form.Group controlId="taskSubmission.solutionLatex">
                                <Form.Label as={"h6"}>LaTeX</Form.Label>
                                <EquationInserter />
                                <Form.Control as="textarea" rows={3} defaultValue={this.state.solution}
                                              onChange={(event) => {
                                                  this.setState({solution: event.target.value});
                                              }}/>
                            </Form.Group>
                        </Card.Body> : null
                    }
                </Card>
            </Col>
            <Col>
                <Card>
                    <Card.Header>
                        <Row className="m-0 p-0">
                            <Col className="m-0 p-0">
                                Solve
                            </Col>
                            <Col md="auto" className="m-0 p-0">
                                <Form.Check type="checkbox" checked={this.state.addSolverMetadata}
                                            onChange={(e) => this.setState({addSolverMetadata: e.target.checked})}/>
                            </Col>
                        </Row>
                    </Card.Header>
                    {
                        this.state.addSolverMetadata ? 
                            <ProblemSolveForm 
                                solverMetadata={this.state.solverMetadata} 
                                setSolverMetadata={(solverMetadata) => this.setState({solverMetadata}, ()=>console.log(solverMetadata))} /> 
                                : null
                    }
                </Card>
            </Col>
            <Col>
                <Card>
                    <Card.Header>
                        <Row className="m-0 p-0">
                            <Col className="m-0 p-0">
                                Attachments
                            </Col>
                            <Col md="auto" className="m-0 p-0">
                                <Form.Check type="checkbox" checked={this.state.addAttachments}
                                            onChange={(e) => this.setState({addAttachments: e.target.checked})}/>
                            </Col>
                        </Row>
                    </Card.Header>
                    {
                        this.state.addAttachments ? <Card.Body>
                            <ProblemAttachmentsForm attachments={this.state.attachments} ocrAttachments={this.state.ocrAttachments} upload={this.props.upload}
                                                    onChange={(attachments) => this.setState({attachments})}></ProblemAttachmentsForm>
                        </Card.Body> : null
                    }
                </Card>
            </Col>
            <Col>
                <Stack direction="horizontal" gap={2}>
                    <Button variant="primary" disabled={this.state.submitting}
                            onClick={!this.state.submitting ? this.submit : null}>
                        {!this.state.submitting ? 'Save' : <>
                            <Spinner animation="border" role="status" size="sm" className="me-2"></Spinner>
                            Loading...
                        </>}
                    </Button>
                    {
                        this.props.children
                    }
                </Stack>
            </Col>
        </Row>;
    }
}

export default ProblemForm;
