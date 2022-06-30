import {config} from "../Constants";
import keycloak from "../keycloak";

function list(page = 0, size = 20) {
    return fetch(`${config.url.API_BASE_URL}/problem?page=${page}&sort=id,desc&size=${size}`, {
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
    return fetch(`${config.url.API_BASE_URL}/problem/${id}`, {
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

async function create(obj, ocrs) {
    let res = await fetch(`${config.url.API_BASE_URL}/problem`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${keycloak.token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ...obj,
            ocrResults: ocrs.map(r => r.id)
        })
    })
    if (!res.ok) {
        throw Error(`${res.status} ${res.statusText} - failed saving OCRResult`);
    }

    return await res.json();
}

async function update(id, obj) {
    const ocrs = await getOCRResults(id);
    let res = await fetch(`${config.url.API_BASE_URL}/problem/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${keycloak.token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ...obj,
            ocrResults: ocrs.map(r => r.id)
        })
    })
    if (!res.ok) {
        throw Error(`${res.status} ${res.statusText} - failed saving OCRResult`);
    }

    return res.json();
}

function getOCRResults(id) {
    return fetch(`${config.url.API_BASE_URL}/problem/${id}/ocrResults`, {
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

async function remove(id) {
    const res = await fetch(`${config.url.API_BASE_URL}/problem/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${keycloak.token}`
        }
    });

    if (!res.ok) {
        throw Error(`${res.status} ${res.statusText} - failed deleting Problem`);
    }

    return true;
}

const problems = {
    list,
    get,
    getOCRResults,
    create,
    update,
    remove
}

export default problems;
