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
                {
                    items.map((problem) => <ProblemRow key={problem.id} problem={problem} onRemove={onRemove}></ProblemRow>)
                }
            </tbody>
        </Table>
    );
}

export default ProblemsTable;
