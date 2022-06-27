import React from 'react';
import {Badge, Button, ButtonGroup, Dropdown, Spinner} from "react-bootstrap";
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

        this.runOCR = this.runOCR.bind(this);
        this.convert = this.convert.bind(this);
        this.remove = this.remove.bind(this);
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

    remove() {
        const {upload, onRemove} = this.props;
        API.sourceUploads.remove(upload.id)
            .then(r => onRemove());
    }

    runOCR() {
        const {upload} = this.props;
        API.ocr.request(upload.id)
            .then(_ => alert(`OCR for ${upload.id} was scheduled!`));
    }

    convert() {
        const {upload} = this.props;
        API.sourceUploads.convert(upload.id)
            .then(_ => alert(`Conversion for ${upload.id} was scheduled!`));
    }

    status(statusCounts) {
        return statusCounts.map(value => (
            <Badge key={value.key} pill bg={UploadRowStatusColors[value.key]} className="me-1 align-middle">
                {value.count} {value.key.toLowerCase()}
            </Badge>
        ));
    }

    actions(done) {
        const {upload} = this.props;

        return (<Dropdown as={ButtonGroup} size="sm" className="align-middle">
            {
                done ? <Button variant="outline-secondary" as={NavLink}
                               to={`/uploads/${upload.id}/review`}>Review</Button> :
                    <Button variant="outline-secondary" as={NavLink} to={`/uploads/${upload.id}`}>Edit</Button>
            }

            <Dropdown.Toggle split variant="outline-secondary"/>

            <Dropdown.Menu>
                {
                    done ? <>
                        <Dropdown.Item as={NavLink} to={`/uploads/${upload.id}`}>Edit</Dropdown.Item>
                        <Dropdown.Divider/>
                    </> : null
                }
                <Dropdown.Item onClick={this.runOCR}>Run OCR</Dropdown.Item>
                {
                    upload.metadata != null ? <Dropdown.Item onClick={this.convert}>Convert</Dropdown.Item> : null
                }
                <Dropdown.Divider/>
                <Dropdown.Item className="text-danger" onClick={this.remove}>Delete</Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>);
    }

    render() {
        const {upload} = this.props;
        const {error, isLoaded, ocrResults} = this.state;

        const statusGrouped = ocrResults.reduce((groups, item) => {
            if (item.status === null) {
                item.status = 'UNKNOWN';
            }

            return {
                ...groups,
                [item.status]: [...(groups[item.status] || []), item]
            }
        }, {});
        const statusCounts = Object.keys(statusGrouped).map(key => ({key, count: statusGrouped[key].length}));

        const done = statusGrouped['DONE'] == null ? false : statusGrouped['DONE'].length === ocrResults.length;

        return (
            <tr>
                <td className="text-truncate align-middle">{upload.id}</td>
                {
                    error === null && isLoaded ? (
                        <>
                            <td className="text-truncate align-middle">{ocrResults.length} region(s)</td>
                            <td className="text-truncate align-middle">
                                {
                                    this.status(statusCounts)
                                }
                            </td>
                        </>
                    ) : (
                        <td className="text-truncate align-middle" colSpan={2}>
                            {
                                error !== null ? error : <Spinner animation="border" role="status" size="sm">
                                    <span className="visually-hidden">Loading...</span>
                                </Spinner>
                            }
                        </td>
                    )
                }
                <td>
                    {
                        this.actions(done)
                    }
                </td>
            </tr>
        );
    }
}

export default UploadRow;
