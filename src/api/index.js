import sourceUploads from './sourceUploads';
import ocr from './ocr';
import problems from './problems';

const API = {
    sourceUploads,
    ocr,
    problems
}

if (process.env.NODE_ENV === 'development') {
    window.API = API;
}

export default API;
