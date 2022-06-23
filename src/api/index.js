import sourceUploads from './sourceUploads';
import ocr from './ocr';
import problems from './problems';
import uploads from './uploads';

const API = {
    sourceUploads,
    ocr,
    problems,
    uploads
}

if (process.env.NODE_ENV === 'development') {
    window.API = API;
}

export default API;
