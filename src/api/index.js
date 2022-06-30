import uploads from './uploads';
import ocr from './ocr';
import problems from './problems';
import files from './files';

const API = {
    uploads,
    ocr,
    problems,
    files
}

if (process.env.NODE_ENV === 'development') {
    window.API = API;
}

export default API;
