import {config} from "../Constants";
import keycloak from "../keycloak";

function list(page = 0, size = 20) {
    return fetch(`${config.url.API_BASE_URL}/problems?` + new URLSearchParams({
        page,
        size,
        sort: 'id,desc'
    }).toString(), {
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

function search(id, page = 0, size = 20) {
    return fetch(`${config.url.API_BASE_URL}/problems/search?` + new URLSearchParams({
        id,
        page,
        size
    }).toString(), {
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

async function syncToCore(id) {
    let res = await fetch(`${config.url.API_BASE_URL}/problems/${id}/syncToCore`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${keycloak.token}`
        }
    })
    if (!res.ok) {
        throw Error(`${res.status} ${res.statusText} - failed requesting sync to core API`);
    }

    return await res.json();
}

function getNewAttachments(newAttachments) {
    let attachments = [];

    newAttachments.forEach(attachment => {
        let result = {};
        if(attachment.ocrID){
            result = {
                fileName: attachment.fileName,
                metadata: {type: "ocr", ocrId: attachment.ocrID}
            }
        } else {
            result = {
                fileName: attachment.fileName,
                metadata: {type: "upload"}
            }
        }

        attachments.push(result);
    });

    return attachments;
}

async function create(obj, ocrs) {
    const newAttachments = obj.attachments;
    let attachments = getNewAttachments(newAttachments);
    
    let res = await fetch(`${config.url.API_BASE_URL}/problems`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${keycloak.token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ...obj,
            ocrResults: ocrs.map(r => r.id),
            attachments
        })
    })
    if (!res.ok) {
        throw Error(`${res.status} ${res.statusText} - failed saving OCRResult`);
    }

    return await res.json();
}

async function update(id, obj) {
    if(!obj.ocrResults) {
        obj.ocrResults = [];
    }
    const existingOCRs = await getOCRResults(id);
    let ocrs = existingOCRs.concat(obj.ocrResults);

    const problemAttachments = obj.attachments;
    const newAttachments = problemAttachments.filter(r => !r.metadata);
    const existingAttachments = problemAttachments.filter(r => r.metadata);
    let _newAttachments = getNewAttachments(newAttachments);
    const attachments = existingAttachments.concat(_newAttachments);

    if(obj.deleteOCR) {
        obj.deleteOCR.forEach((ocr) => {
            const index = ocrs.findIndex(_ocr => _ocr.id === ocr);
            if(index !== -1){
                ocrs.splice(index, 1);
            }
        });

        delete obj.deleteOCR;
    }
    
    let res = await fetch(`${config.url.API_BASE_URL}/problems/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${keycloak.token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ...obj,
            ocrResults: ocrs.map(r => r.id),
            attachments
        })
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
        .then(res => res.json());
}

async function remove(id) {
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
    search,
    get,
    getOCRResults,
    syncToCore,
    create,
    update,
    remove
}

export default problems;
