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

function getById(id) {
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

const sourceUploads = {
    list,
    getById
};

export default sourceUploads;
