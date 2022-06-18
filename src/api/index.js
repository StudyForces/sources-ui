import sourceUploads from './sourceUploads';
import ocr from './ocr';

const API = {
    sourceUploads,
    ocr
}

if (process.env.NODE_ENV === 'development') {
    window.API = API;
}

export default API;
