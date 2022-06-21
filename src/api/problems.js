import {config} from "../Constants";
import keycloak from "../keycloak";

function list(page = 0, size = 20) {
    return fetch(`${config.url.API_BASE_URL}/problems?page=${page}&sort=id,desc&size=${size}`, {
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
    return fetch(`${config.url.API_BASE_URL}/problems/${id}`, {
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
    let res = await fetch(`${config.url.API_BASE_URL}/problems`, {
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

    const problem = await res.json();

    await Promise.all(ocrs.map(async result => await fetch(`${config.url.API_BASE_URL}/ocrResults/${result.id}/problem`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${keycloak.token}`,
            'Content-Type': 'text/uri-list'
        },
        body: `${config.url.API_BASE_URL}/problems/${problem.id}`
    })));

    return problem;
}

async function update(id, obj) {
    let res = await fetch(`${config.url.API_BASE_URL}/problems/${id}`, {
        method: 'PUT',
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

function getOCRResults(id) {
    return fetch(`${config.url.API_BASE_URL}/problems/${id}/ocrResults`, {
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

async function remove(id) {
    const ocrs = (await getOCRResults(id)).content;

    await Promise.all(ocrs.map(async result => await fetch(`${config.url.API_BASE_URL}/ocrResults/${result.id}/problem`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${keycloak.token}`
        }
    })));

    const res = await fetch(`${config.url.API_BASE_URL}/problems/${id}`, {
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
