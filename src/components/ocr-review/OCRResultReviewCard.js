import React, { Component } from 'react';
import {Badge, Button, Card, Col, Form, Row} from "react-bootstrap";
import Latex from "react-latex";
import API from "../../api";

class OCRResultReviewCard extends Component {

    constructor(props) {
        super(props);

        this.state = {
            result: this.props.result,
            editing: false
        }

        this.enableEditing = this.enableEditing.bind(this);
        this.saveEdit = this.saveEdit.bind(this);
        this.cancelEdit = this.cancelEdit.bind(this);
    }

    enableEditing() {
        this.setState({editing: true});
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

        return <Card body key={result.id} className="mb-2">
            <Row className="mt-0 mb-2">
                <Col>
                    <Badge bg="primary" className="me-2">{result.type}</Badge>
                </Col>
                <Col md="auto">
                    <Form.Check type="checkbox" disabled={this.state.editing} />
                </Col>
            </Row>
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
        </Card>;
    }
}

export default OCRResultReviewCard;
