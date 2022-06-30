import {config} from "../Constants";
import keycloak from '../keycloak';
import files from "./files";

async function list(page = 0, size = 20) {
    const res = await fetch(`${config.url.API_BASE_URL}/upload?page=${page}&sort=id,desc&size=${size}`, {
        headers: {
            'Authorization': `Bearer ${keycloak.token}`
        }
    })
    if (!res.ok) {
        throw Error(`${res.status} ${res.statusText}`);
    }
    return await res.json();
}

function get(id) {
    return fetch(`${config.url.API_BASE_URL}/upload/${id}`, {
        headers: {
            'Authorization': `Bearer ${keycloak.token}`
        }
    })
        .then(res => {
            if (!res.ok) {
                throw Error(`${res.status} ${res.statusText}`);
            }
            return res;
        })
        .then(res => res.json());
}

function getOCRResults(id) {
    return fetch(`${config.url.API_BASE_URL}/upload/${id}/ocrResults`, {
        headers: {
            'Authorization': `Bearer ${keycloak.token}`
        }
    })
        .then(res => {
            if (!res.ok) {
                throw Error(`${res.status} ${res.statusText}`);
            }
            return res;
        })
        .then(res => res.json());
}

async function create(file) {
    const uploadData = await files.upload(file, files.UploadType.SOURCE);

    const res = await fetch(`${config.url.API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${keycloak.token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            fileName: uploadData.fileName
        })
    })
    if (!res.ok) {
        throw Error(`${res.status} ${res.statusText} - failed saving upload`);
    }

    return await res.json();
}

function remove(id) {
    return fetch(`${config.url.API_BASE_URL}/upload/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${keycloak.token}`
        }
    })
        .then(res => {
            if (!res.ok) {
                throw Error(`${res.status} ${res.statusText}`);
            }
            return res;
        });
}

async function saveOCRResults(sourceUpload, results) {
    const res = await fetch(`${config.url.API_BASE_URL}/upload/${sourceUpload.id}/ocrResults`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${keycloak.token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ocrResults: results
        })
    })
    if (!res.ok) {
        throw Error(`${res.status} ${res.statusText} - failed saving OCRs`);
    }

    return await res.json();
}

function convert(id) {
    return fetch(`${config.url.API_BASE_URL}/upload/${id}/convert`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${keycloak.token}`
        },
    })
        .then(res => {
            if (!res.ok) {
                throw Error(`${res.status} ${res.statusText}`);
            }
            return res;
        });
}

function getFileInfo(id) {
    return fetch(`${config.url.API_BASE_URL}/upload/${id}/info`, {
        headers: {
            'Authorization': `Bearer ${keycloak.token}`
        }
    })
        .then(res => {
            if (!res.ok) {
                throw Error(`${res.status} ${res.statusText}`);
            }
            return res;
        })
        .then(res => res.json());
}

const uploads = {
    list,
    get,
    getOCRResults,
    create,
    remove,
    saveOCRResults,
    convert,
    getFileInfo
};

export default uploads;
