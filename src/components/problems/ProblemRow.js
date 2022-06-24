import React from 'react';
import {Badge, Button, ButtonGroup, Dropdown, Spinner} from "react-bootstrap";
import {NavLink} from "react-router-dom";
import Latex from "../misc/Latex";
import API from "../../api";

class ProblemRow extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
            isLoaded: false,
            ocrResults: []
        };

        this.remove = this.remove.bind(this);
    }

    componentDidMount() {
        API.problems.getOCRResults(this.props.problem.id)
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        ocrResults: result.content,
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
                        {problem.solution === null ? 'NO SOL' : 'SOL'}
                    </Badge>
                    <Latex spanned={true} children={problem.problem}></Latex>
                </td>
                {
                    error === null && isLoaded ? (
                        <td className="text-truncate align-middle">
                            {
                                ocrResults.map(value => <>
                                    <Badge key={value.id} pill bg="primary" className="me-1 align-middle">
                                        #{value.id}
                                    </Badge>
                                    <br />
                                </>)
                            }
                        </td>
                    ) : (
                        <td className="text-truncate align-middle">
                            {
                                error !== null ? error : <Spinner animation="border" role="status" size="sm">
                                    <span className="visually-hidden">Loading...</span>
                                </Spinner>
                            }
                        </td>
                    )
                }
                <td className="align-middle">
                    <Dropdown as={ButtonGroup} size="sm" className="align-middle">
                        <Button size="sm" variant="outline-secondary" as={NavLink}
                                to={`/problems/${problem.id}`}>Review</Button>

                        <Dropdown.Toggle split variant="outline-secondary"/>

                        <Dropdown.Menu>
                            <Dropdown.Item className="text-danger" onClick={this.remove}>Delete</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </td>
            </tr>
        );
    }
}

export default ProblemRow;
