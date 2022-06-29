import {config} from "../Constants";
import keycloak from '../keycloak';

function request(id) {
    return fetch(`${config.url.API_BASE_URL}/ocr/request/${id}`, {
        method: 'POST',
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

async function saveOCRResult(sourceUploadID, obj) {
    let res = await fetch(`${config.url.API_BASE_URL}/ocrResults`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${keycloak.token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(obj)
    })
    if (!res.ok) {
        throw Error(`${res.status} ${res.statusText} - failed saving OCRResult`);
    }

    return res.json();
}

function list(page = 0, size = 20) {
    return fetch(`${config.url.API_BASE_URL}/ocrResults?page=${page}&sort=id,desc&size=${size}`, {
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
    return fetch(`${config.url.API_BASE_URL}/ocrResults/${id}`, {
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

function getProblem(id) {
    return fetch(`${config.url.API_BASE_URL}/ocrResults/${id}/problem`, {
        headers: {
            'Authorization': `Bearer ${keycloak.token}`
        }
    })
        .then(res => {
            if (!res.ok) {
                return null
            }
            return res.json();
        });
}

function update(id, obj) {
    return fetch(`${config.url.API_BASE_URL}/ocrResults/${id}`, {
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

function remove(id) {
    return fetch(`${config.url.API_BASE_URL}/ocrResults/${id}`, {
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

const ocr = {
    request,
    saveOCRResult,
    list,
    get,
    getProblem,
    update,
    remove
};

export default ocr;
