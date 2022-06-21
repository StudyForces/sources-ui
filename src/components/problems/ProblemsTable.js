import React from 'react';
import {Table} from "react-bootstrap";
import ProblemRow from "./ProblemRow";

function ProblemsTable(props) {
    const {items, onRemove} = props;
    return (
        <Table responsive striped hover size="sm">
            <thead>
            <tr>
                <th>#</th>
                <th>Problem</th>
                <th className="text-truncate">Related OCRs</th>
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
