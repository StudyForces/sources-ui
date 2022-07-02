import API from "../../api";

export const getOCRCardsInfo = (type ,setNewState, imageState, uploadId, problemId) => {
    
    const requestResult = requestChoose(type, uploadId, problemId);
    
    Promise.all([requestResult()])
        .then(
            (result) => {
                const results = result[0];
                
                Promise.all([API.ocr.getUpload(results[0].id)])
                .then(
                    (r) => {
                        setNewState({
                            isLoaded: true,
                            results,
                            upload: r[0],
                        });
                        loadImage(setNewState, imageState, r[0]);
                    }, (error) => setErrorState(setNewState, imageState, error)
                )
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