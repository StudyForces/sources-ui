import {config} from "../Constants";
import keycloak from '../keycloak';

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

function update(id, obj) {
    return fetch(`${config.url.API_BASE_URL}/sourceUploads/${id}`, {
        method: 'POST',
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

const sourceUploads = {
    list,
    get,
    update,
    create,
    remove
};

export default sourceUploads;
