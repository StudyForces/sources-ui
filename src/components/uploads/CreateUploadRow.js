import React, {useState} from 'react';
import {Button} from "react-bootstrap";
import API from "../../api";
import {useHistory} from "react-router-dom";

function CreateUploadRow() {
    const history = useHistory();

    const [file, setFile] = useState();
    const [error, setError] = useState();

    return (
        <tr>
            <td className="text-truncate align-middle">new</td>
            <td className="text-truncate align-middle">
                <input type="file" accept="image/*" onChange={(event) => setFile(event.target.files[0])}
                       capture="environment" />
            </td>
            <td className="text-truncate align-middle">{ error ? error.message : ''}</td>
            <td>
                <Button variant="outline-secondary" size="sm" onClick={() => {
                    setError(null);
                    API.sourceUploads.create(file)
                        .then(
                            (result) => {
                                history.push(`/uploads/${result.id}`);
                            },
                            (error) => {
                                setError(error);
                            }
                        );
                }}>Upload</Button>
            </td>
        </tr>
    );
}

export default CreateUploadRow;
