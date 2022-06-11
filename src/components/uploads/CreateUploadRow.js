import React, {useState} from 'react';
import {Button, Spinner} from "react-bootstrap";
import API from "../../api";
import {useHistory} from "react-router-dom";

function CreateUploadRow() {
    const history = useHistory();

    const [file, setFile] = useState();
    const [error, setError] = useState();
    const [loading, setLoading] = useState(false);

    return (
        <tr>
            <td className="text-truncate align-middle">new</td>
            <td className="text-truncate align-middle">
                <input type="file" accept="image/*" onChange={(event) => setFile(event.target.files[0])}
                       capture="environment" />
            </td>
            <td className="text-truncate align-middle">{ error ? error.message : ''}</td>
            <td>
                {
                    loading ? <Spinner animation="border" role="status" size="sm">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner> : <Button variant="outline-secondary" size="sm" onClick={() => {
                        setError(null);
                        setLoading(true);
                        API.sourceUploads.create(file)
                            .then(
                                (result) => {
                                    history.push(`/uploads/${result.id}`);
                                    setLoading(false);
                                },
                                (error) => {
                                    setError(error);
                                    setLoading(false);
                                }
                            );
                    }}>Upload</Button>
                }

            </td>
        </tr>
    );
}

export default CreateUploadRow;
