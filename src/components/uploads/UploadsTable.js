import React from 'react';
import {Badge, Button, ButtonGroup, Dropdown, Table} from "react-bootstrap";
import {config} from "../../Constants";
import UploadRow from "./UploadRow";

function UploadsTable(props) {
    const {items} = props;
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
            {
                items.map((upload) => <UploadRow key={upload.id} upload={upload}></UploadRow>)
            }
            </tbody>
        </Table>
    );
}

export default UploadsTable;
