import {config} from "../Constants";
import keycloak from "../keycloak";

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

const problems = {
    create
}

export default problems;
