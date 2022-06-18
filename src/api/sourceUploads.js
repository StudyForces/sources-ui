import {config} from "../Constants";
import keycloak from '../keycloak';
import ocr from "./ocr";

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

function getImage(id) {
    return fetch(`${config.url.API_BASE_URL}/upload/view/${id}`, {
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
        .then(res => res.blob());
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
    let res = await fetch(`${config.url.API_BASE_URL}/upload/request`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${keycloak.token}`,
            'Content-Type': file.type
        }
    });
    if (!res.ok) {
        throw Error(`${res.status} ${res.statusText} - failed request for PUT signed URL`);
    }
    const uploadData = await res.json();

    res = await fetch(uploadData.url, {
        method: 'PUT',
        headers: {
            'Content-Type': file.type
        },
        body: file
    })
    if (!res.ok) {
        throw Error(`${res.status} ${res.statusText} - failed uploading file`);
    }

    res = await fetch(`${config.url.API_BASE_URL}/upload/save`, {
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

    const resultURLs = saved
        .map(result => result.links.find(link => link.rel === 'self'))
        .filter(link => link !== null)
        .map(link => link.href);

    const res = await fetch(`${config.url.API_BASE_URL}/sourceUploads/${sourceUpload.id}/ocrResults`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${keycloak.token}`,
            'Content-Type': 'text/uri-list'
        },
        body: resultURLs.reduce((previousValue, currentValue) => {
            return previousValue + `${currentValue}\n`
        }, '')
    })

    if (!res.ok) {
        throw Error(`${res.status} ${res.statusText}`);
    }

    return true;
}

const sourceUploads = {
    list,
    get,
    getImage,
    getOCRResults,
    update,
    create,
    remove,
    saveOCRResults
};

export default sourceUploads;
