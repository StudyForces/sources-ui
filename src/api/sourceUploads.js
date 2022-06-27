import {config} from "../Constants";
import keycloak from '../keycloak';
import ocr from "./ocr";
import uploads from "./uploads";

function list(page = 0, size = 20) {
    return fetch(`${config.url.API_BASE_URL}/sourceUploads?page=${page}&sort=id,desc&size=${size}`, {
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
        .then(res => res.json())
        .then(res => {
            if (res.content.length === 1) {
                if (res.content[0].value !== undefined) {
                    res.content = [];
                }
            }
            return res;
        });
}

function get(id) {
    return fetch(`${config.url.API_BASE_URL}/sourceUploads/${id}`, {
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
    return fetch(`${config.url.API_BASE_URL}/sourceUploads/${id}/ocrResults`, {
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
        .then(res => res.json())
        .then(res => {
            if (res.content.length === 1) {
                if (res.content[0].value !== undefined) {
                    res.content = [];
                }
            }
            return res;
        });
}

function update(id, obj) {
    return fetch(`${config.url.API_BASE_URL}/sourceUploads/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${keycloak.token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(obj)
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
    const uploadData = await uploads.upload(file, uploads.UploadType.SOURCE);

    const res = await fetch(`${config.url.API_BASE_URL}/upload/save`, {
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
    return fetch(`${config.url.API_BASE_URL}/sourceUploads/${id}`, {
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
    const saved = await Promise.all(results.map(async result => {
        if (result.id === undefined) {
            return await ocr.saveOCRResult(sourceUpload.id, result)
        } else {
            return result
        }
    }));

    await Promise.all(saved.map(async result => await fetch(`${config.url.API_BASE_URL}/ocrResults/${result.id}/sourceUpload`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${keycloak.token}`,
            'Content-Type': 'text/uri-list'
        },
        body: `${config.url.API_BASE_URL}/sourceUploads/${sourceUpload.id}`
    })));

    return true;
}

function convert(id) {
    return fetch(`${config.url.API_BASE_URL}/upload/convert/${id}`, {
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
    return fetch(`${config.url.API_BASE_URL}/upload/info/${id}`, {
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

const sourceUploads = {
    list,
    get,
    getOCRResults,
    update,
    create,
    remove,
    saveOCRResults,
    convert,
    getFileInfo
};

export default sourceUploads;
