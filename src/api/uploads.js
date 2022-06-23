import {config} from "../Constants";
import keycloak from "../keycloak";

const UploadType = {
    SOURCE: "SOURCE",
    ATTACHMENT: "ATTACHMENT"
}

async function upload(file, type) {
    if (file === null || file === undefined) {
        throw Error('No file!');
    }

    let res = await fetch(`${config.url.API_BASE_URL}/upload/request?` + new URLSearchParams({
        type
    }).toString(), {
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

    return uploadData;
}

function view(sourceFile) {
    return fetch(`${config.url.API_BASE_URL}/upload/view?` + new URLSearchParams({
        file: sourceFile
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
        .then(res => res.blob());
}

const uploads = {
    UploadType,
    upload,
    view
};

export default uploads;