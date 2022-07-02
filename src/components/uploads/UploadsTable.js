import React from 'react';
import {Table} from "react-bootstrap";
import UploadRow from "./UploadRow";

function UploadsTable(props) {
    const {items, onRemove} = props;
    return (
        <Table responsive striped hover size="sm">
            <thead>
            <tr>
                <th>#</th>
                <th>Regions</th>
                <th>Status</th>
                <th>Actions</th>
            </tr>
            </thead>
            <tbody>
                {
                    items.map((upload) => <UploadRow key={upload.id} upload={upload} onRemove={onRemove}></UploadRow>)
                }
            </tbody>
        </Table>
    );
}

export default UploadsTable;
