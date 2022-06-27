import React from 'react';
import {Button, Table} from "react-bootstrap";
import ProblemRow from "./ProblemRow";
import {NavLink} from "react-router-dom";

function ProblemsTable(props) {
    const {items, onRemove} = props;
    return (
        <Table responsive striped hover size="sm">
            <thead>
            <tr>
                <th>#</th>
                <th>Problem</th>
                <th>Actions</th>
            </tr>
            </thead>
            <tbody>
                <tr>
                    <td colSpan={2}></td>
                    <td>
                        <Button as={NavLink} to="/problems/new" size="sm" variant="outline-primary">New</Button>
                    </td>
                </tr>
                {
                    items.map((problem) => <ProblemRow key={problem.id} problem={problem} onRemove={onRemove}></ProblemRow>)
                }
            </tbody>
        </Table>
    );
}

export default ProblemsTable;
