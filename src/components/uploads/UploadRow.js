import React from 'react';
import {Badge, Button, ButtonGroup, Dropdown} from "react-bootstrap";
import {config} from "../../Constants";
import {NavLink} from "react-router-dom";
import API from "../../api";

const UploadRowStatusColors = {
    'DONE': 'success',
    'PENDING': 'info',
    'UNKNOWN': 'secondary',
}

class UploadRow extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
            isLoaded: false,
            ocrResults: []
        };
    }

    componentDidMount() {
        API.sourceUploads.getOCRResults(this.props.upload.id)
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

    render() {
        const {upload, onRemove} = this.props;

        const results = this.state.ocrResults;

        const statusGrouped = results.reduce((groups, item) => {
            if (item.status === null) {
                item.status = 'UNKNOWN';
            }

            return {
                ...groups,
                [item.status]: [...(groups[item.status] || []), item]
            }
        }, {});
        const statusCounts = Object.keys(statusGrouped).map(key => ({key, count: statusGrouped[key].length}));

        const done = statusGrouped['DONE'] == null ? false : statusGrouped['DONE'].length === results.length;

        const remove = () => {
            API.sourceUploads.remove(upload.id)
                .then(r => onRemove());
        };
        const runOCR = () => {
            API.ocr.request(upload.id)
                .then(_ => alert(`OCR for ${upload.id} was scheduled!`));
        };

        return (
            <tr>
                <td className="text-truncate align-middle">{upload.id}</td>
                <td className="text-truncate align-middle">{results.length} region(s)</td>
                <td className="text-truncate align-middle">
                    {
                        statusCounts.map(value => (
                            <Badge key={value.key} pill bg={UploadRowStatusColors[value.key]} className="me-1 align-middle">
                                {value.count} {value.key.toLowerCase()}
                            </Badge>
                        ))
                    }
                </td>
                <td>
                    <Dropdown as={ButtonGroup} size="sm" className="align-middle">
                        {
                            done ? <Button variant="outline-secondary" as={NavLink} to={`/uploads/${upload.id}/review`}>Review</Button> :
                                <Button variant="outline-secondary" as={NavLink} to={`/uploads/${upload.id}`}>Edit</Button>
                        }

                        <Dropdown.Toggle split variant="outline-secondary" />

                        <Dropdown.Menu>
                            {
                                done ? <>
                                    <Dropdown.Item as={NavLink} to={`/uploads/${upload.id}`}>Edit</Dropdown.Item>
                                    <Dropdown.Divider />
                                </> : null
                            }
                            <Dropdown.Item onClick={runOCR}>Run OCR</Dropdown.Item>
                            <Dropdown.Item href={`${config.url.API_BASE_URL}/upload/view/${upload.id}`}>
                                View Image
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item className="text-danger" onClick={remove}>Delete</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </td>
            </tr>
        );
    }
}

export default UploadRow;
