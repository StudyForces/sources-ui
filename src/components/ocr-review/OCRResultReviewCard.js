import React, { Component } from 'react';
import {Badge, Button, Card, Col, Dropdown, Form, Row, Spinner} from "react-bootstrap";
import {NavLink} from "react-router-dom";
import API from "../../api";
import cropImage from "../helpers/cropImage";
import EquationInserter from "../misc/EquationInserter";
import ProblemPinner from './ProblemPinner';
import ReactKatex from "@pkasila/react-katex";

class OCRResultReviewCard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            result: this.props.result,
            editing: false,
            selected: false,
            problem: null,
            image: null,
            copied: false,
            unpinning: false
        }

        this.getProblem = this.getProblem.bind(this);
        this.enableEditing = this.enableEditing.bind(this);
        this.saveEdit = this.saveEdit.bind(this);
        this.cancelEdit = this.cancelEdit.bind(this);
        this.handleSelection = this.handleSelection.bind(this);
        this.actions = this.actions.bind(this);
        this.copyAction = this.copyAction.bind(this);
        this.unpinOCR = this.unpinOCR.bind(this);
    }

    componentDidMount() {
        this.getProblem();
    }

    getProblem() {
        API.ocr.getProblem(this.props.result.id)
            .then((problem) => {
                this.setState({problem, unpinning: false});
            }, (error) => {
                this.setState({problem: null, unpinning: false})
            });
    }

    static getDerivedStateFromProps(props, _) {
        return {
            selected: props.selected,
            image: props.image !== null ? cropImage(props.image, props.result.rect).toDataURL() : null
        };
    }

    enableEditing() {
        this.setState({editing: true, selected: false}, () => {
            this.props.onSelect(this.state.result, false);
        });
    }

    handleSelection(event) {
        this.props.onSelect(this.state.result, event.target.checked);
    }

    saveEdit() {
        this.props.onSave(this.state.result, () => this.setState({editing: false}));
    }

    cancelEdit() {
        API.ocr.get(this.props.result.id)
            .then(result => {
                this.setState({result, editing: false});
            });
    }

    content() {
        const {result, editing} = this.state;

        if (result.data === null || result.data === undefined) {
            return null;
        }

        switch (result.type) {
            case "TEXT":
                return <>
                    <ReactKatex strict={false} children={result.data.text}></ReactKatex>
                    {
                        editing ? <>
                            <EquationInserter />
                            <Form.Control as="textarea" rows={3} value={result.data.text}
                                          onChange={(event) => {
                                              const newResult = Object.assign(result, {data: {text: event.target.value}});
                                              this.setState({result: newResult});
                                          }} />
                        </> : null
                    }
                </>;

            case "FORMULA":
                return <>
                    <ReactKatex strict={false} displayMode={true} children={`$${result.data.latex}$`}></ReactKatex>
                    {
                        editing ? <>
                            <EquationInserter />
                            <Form.Control as="textarea" rows={3} value={result.data.latex}
                                          onChange={(event) => {
                                              const newResult = Object.assign(result, {data: {latex: event.target.value}});
                                              this.setState({result: newResult});
                                          }} />
                        </> : null
                    }
                </>
            default:
                return <code>UNKNOWN TYPE: {result.type}</code>
        }
    }

    copyAction() {
        switch (this.state.result.type) {
            case "TEXT":
                return <Button onClick={() => {
                    navigator.clipboard.writeText(this.state.result.data.text);
                }} variant="outline-success" size="sm" className="ms-1">Copy</Button>;
            case "FORMULA":
                return <Button onClick={() => {
                    navigator.clipboard.writeText(`$$${this.state.result.data.latex}$$`);
                }} variant="outline-success" size="sm" className="ms-1">Copy</Button>
            default:
                return null;
        }
    }

    unpinOCR() {
        const {problem, result} = this.state;

        this.setState({unpinning: true});
        let updProblem = problem;
        updProblem = {
            ...updProblem,
            deleteOCR: [result.id]
        };

        API.problems.update(updProblem.id, updProblem)
            .then((r) => {
                if(this.props.updateResults && this.props.updateProblem){
                    this.props.updateResults();
                    this.props.updateProblem();
                } else {
                    this.getProblem();
                }
            });
    }

    actions() {
        if (this.state.editing) {
            return <>
                <Button onClick={this.saveEdit} variant="primary" size="sm" className="me-1">Save</Button>
                <Button onClick={this.cancelEdit} variant="danger" size="sm">Cancel</Button>
            </>;
        }

        return <>
            {
                this.state.result.type !== 'PICTURE' ?
                    <Button onClick={this.enableEditing} variant="secondary" size="sm">Edit</Button> : null
            }
            {this.copyAction()}
        </>;
    }

    render() {
        const {result} = this.props;

        return <Card key={result.id}>
            <Card.Header>
                <Row className="m-0 p-0">
                    <Col className="m-0 p-0">
                        <Badge bg="primary" className="me-2">{result.type}</Badge>
                    </Col>
                    <Col md="auto" className="me-3 p-0">
                        {
                            this.state.problem ? <span/> :
                            <ProblemPinner
                                ocr={result}
                                upload={this.props.upload}
                                getProblem={this.getProblem}
                                problems={this.props.problems}
                                problemError={this.props.problemError} />
                        }
                    </Col>
                    <Col md="auto" className="m-0 p-0">
                        {
                            this.state.problem ?
                            <Row className="m-0 p-0">
                                <Col className="me-2 p-0">
                                    <Badge
                                        disabled={this.state.unpinning}
                                        bg="danger"
                                        style={{cursor: "pointer"}}
                                        onClick={!this.state.unpinning ? this.unpinOCR : null}>
                                            {!this.state.unpinning ? 'Unpin' : 'Loading...'}
                                    </Badge>
                                </Col>
                                <Col className="m-0 p-0">
                                    <NavLink to={`/problems/${this.state.problem.id}`}>
                                        <Badge bg="secondary">
                                            Problem #{this.state.problem.id}
                                        </Badge>
                                    </NavLink>
                                </Col>
                            </Row>
                            : <Form.Check type="checkbox" disabled={this.state.editing}
                                                     checked={this.state.selected}
                                                     onChange={this.handleSelection} />
                        }
                    </Col>
                </Row>
            </Card.Header>
            <Card.Body>
                {
                    this.state.image !== null ? <img src={this.state.image}
                                                     style={{width: "100%", maxHeight: "300px", objectFit: 'contain'}}
                                                     alt="Rect"></img> :
                        <Spinner animation="border" role="status" size="sm">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                }
                {
                    this.content()
                }
                <div className="mt-3">
                    {
                        this.actions()
                    }
                </div>
            </Card.Body>
        </Card>;
    }
}

export default OCRResultReviewCard;
