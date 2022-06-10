import React from 'react';
import {Table} from "react-bootstrap";
import UploadRow from "./UploadRow";
import CreateUploadRow from "./CreateUploadRow";

function UploadsTable(props) {
    const {items, onRemove} = props;
    return (
        <Table striped hover size="sm">
            <thead>
            <tr>
                <th>#</th>
                <th>Regions</th>
                <th>Status</th>
                <th>Actions</th>
            </tr>
            </thead>
            <tbody>
                <CreateUploadRow></CreateUploadRow>
                {
                    items.map((upload) => <UploadRow key={upload.id} upload={upload} onRemove={onRemove}></UploadRow>)
                }
            </tbody>
        </Table>
    );
}

export default UploadsTable;
