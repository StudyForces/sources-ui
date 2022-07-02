import API from "../../api";

export const getOCRCardsInfo = (type ,setNewState, imageState, uploadId, problemId) => {
    const requestResult = requestChoose(type, uploadId, problemId);
    Promise.all([
        requestResult(),
        API.uploads.get(uploadId)
    ])
        .then(
            (result) => {
                setNewState({
                    isLoaded: true,
                    results: result[0],
                    upload: result[1],
                });
                loadImage(setNewState, imageState, result[1]);
            },
            (error) => setErrorState(setNewState, imageState, error)
        );
}

const loadImage = (setNewState, imageState, upload) => {
    let counter = 0;
    let images = Array.from({length: upload.convertedFiles.length});
    const updState = (idx, image) => {
        images[idx] = image;
        counter++;
        if (counter === upload.convertedFiles.length) {
            setNewState({images});
        }
    };

    Promise.all(upload.convertedFiles.map(file => API.files.view(file.file)))
        .then(
            (results) => {
                results.forEach((result, idx) => {
                    const imgUrl = URL.createObjectURL(result);
                    const image = new Image();
                    image.src = imgUrl;
                    image.onload = () => {
                        updState(idx, image);
                    }
                })
            },
            (error) => setErrorState(setNewState, imageState, error)
        );
}

const requestChoose = (type, uploadId, problemId) => {
    switch(type){
        case "upload_review": 
            return () => API.uploads.getOCRResults(uploadId); 
        case "problem_review": 
            return () => API.problems.getOCRResults(problemId);
        default:
            return () => API.uploads.getOCRResults(uploadId);
    }
}

const setErrorState = (setNewState, imageState, error) => {
    imageState().forEach(image => {
        URL.revokeObjectURL(image.src);
    });
    setNewState({
        isLoaded: true,
        error,
        results: [],
        upload: null,
        images: null
    });
}