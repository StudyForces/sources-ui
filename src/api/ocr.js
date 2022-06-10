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

const ocr = {
    request
};

export default ocr;
