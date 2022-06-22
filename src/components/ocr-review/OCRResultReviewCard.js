import React, { Component } from 'react';
import {Badge, Button, Card, Col, Form, Row, Spinner} from "react-bootstrap";
import {NavLink} from "react-router-dom";
import Latex from "../misc/Latex";
import API from "../../api";
import cropImage from "../helpers/cropImage";

class OCRResultReviewCard extends Component {

    constructor(props) {
        super(props);

        this.state = {
            result: this.props.result,
            editing: false,
            selected: false,
            problem: null,
            image: null
        }

        this.enableEditing = this.enableEditing.bind(this);
        this.saveEdit = this.saveEdit.bind(this);
        this.cancelEdit = this.cancelEdit.bind(this);
        this.handleSelection = this.handleSelection.bind(this);
    }

    componentDidMount() {
        API.ocr.getProblem(this.props.result.id)
            .then(problem => {
                this.setState({problem})
            })
    }

    static getDerivedStateFromProps(props, state) {
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
                    <Latex children={result.data.text}></Latex>
                    {
                        editing ? <Form.Control as="textarea" rows={3} value={result.data.text}
                            onChange={(event) => {
                                const newResult = Object.assign(result, {data: {text: event.target.value}});
                                this.setState({result: newResult});
                            }} /> : null
                    }
                </>;

            case "FORMULA":
                return <>
                    <Latex displayMode={true} children={`$${result.data.latex}$`}></Latex>
                    {
                        editing ? <Form.Control as="textarea" rows={3} value={result.data.latex}
                            onChange={(event) => {
                                const newResult = Object.assign(result, {data: {latex: event.target.value}});
                                this.setState({result: newResult});
                            }} /> : null
                    }
                </>
            default:
                return <code>UNKNOWN TYPE: {result.type}</code>
        }
    }

    render() {
        const {result} = this.props;

        return <Card key={result.id}>
            <Card.Header>
                <Row className="m-0 p-0">
                    <Col className="m-0 p-0">
                        <Badge bg="primary" className="me-2">{result.type}</Badge>
                    </Col>
                    <Col md="auto" className="m-0 p-0">
                        {
                            this.state.problem ? <NavLink to={`/problems/${this.state.problem.id}`}>
                                <Badge bg="secondary">
                                    Problem #{this.state.problem.id}
                                </Badge>
                            </NavLink> : <Form.Check type="checkbox" disabled={this.state.editing}
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
                        !this.state.editing ? <Button onClick={this.enableEditing} variant="secondary" size="sm">Edit</Button>
                            : (
                                <>
                                    <Button onClick={this.saveEdit} variant="primary" size="sm" className="me-1">Save</Button>
                                    <Button onClick={this.cancelEdit} variant="danger" size="sm">Cancel</Button>
                                </>
                            )
                    }
                </div>
            </Card.Body>
        </Card>;
    }
}

export default OCRResultReviewCard;
