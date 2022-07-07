import React from 'react';
import {Badge, Button, ButtonGroup, Dropdown} from "react-bootstrap";
import {NavLink} from "react-router-dom";
import API from "../../api";
import ReactKatex from "@pkasila/react-katex";

class ProblemRow extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
            isLoaded: false,
            ocrResults: []
        };

        this.syncToCore = this.syncToCore.bind(this);
        this.remove = this.remove.bind(this);
    }

    componentDidMount() {
        API.problems.getOCRResults(this.props.problem.id)
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        ocrResults: result,
                    });
                },
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error,
                        ocrResults: [],
                    });
                }
            );
    }

    syncToCore() {
        const {problem} = this.props;
        API.problems.syncToCore(problem.id)
            .then(r => alert(`Problem ${problem.id} is scheduled to be synced with Core API`));
    }

    remove() {
        const {problem, onRemove} = this.props;
        API.problems.remove(problem.id)
            .then(r => onRemove());
    }

    render() {
        const {problem} = this.props;
        const {error, isLoaded, ocrResults} = this.state;

        return (
            <tr>
                <td className="text-truncate align-middle">{problem.id}</td>
                <td className="align-middle">
                    <Badge pill bg={problem.solution === null ? 'danger' : 'success'} className="me-1 align-middle">
                        {problem.solution === null ? 'no sol' : 'sol'}
                    </Badge>
                    {
                        problem.attachments.length > 0 ? <Badge pill bg="primary" className="me-1 align-middle">
                            {problem.attachments.length} attachment{ problem.attachments.length > 1 ? '-s' : null }
                        </Badge> : null
                    }
                    {
                        ocrResults.length > 0 ? <Badge pill bg="secondary" className="me-1 align-middle">
                            {ocrResults.length} OCR{ ocrResults.length > 1 ? 's' : null }
                        </Badge> : null
                    }
                    <ReactKatex strict={false} children={problem.problem}></ReactKatex>
                </td>
                <td className="align-middle">
                    <Dropdown as={ButtonGroup} size="sm" className="align-middle">
                        <Button size="sm" variant="outline-secondary" as={NavLink}
                                to={`/problems/${problem.id}`}>Review</Button>

                        <Dropdown.Toggle split variant="outline-secondary"/>

                        <Dropdown.Menu>
                            {
                                problem.coreId === null || problem.coreId === undefined ? <Dropdown.Item onClick={this.syncToCore}>Sync to Core</Dropdown.Item> :
                                    <Dropdown.Item as={'a'} href={`https://coreui-sf.pkasila.net/problems/${problem.coreId}`}>Synced as #{problem.coreId}</Dropdown.Item>
                            }
                            <Dropdown.Divider></Dropdown.Divider>
                            <Dropdown.Item className="text-danger" onClick={this.remove}>Delete</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </td>
            </tr>
        );
    }
}

export default ProblemRow;
