import API from "../../api";

export const getOCRCardsInfo = (setNewState, id) => {
    Promise.all([
        API.uploads.getOCRResults(id),
        API.uploads.get(id)
    ])
        .then(
            (result) => {
                setNewState({
                    isLoaded: true,
                    results: result[0],
                    upload: result[1],
                });
                loadImage(setNewState, result[1]);
            },
            (error) => setErrorState(setNewState, error)
        );
}

const loadImage = (setNewState, upload) => {
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
            (error) => setErrorState(setNewState, error)
        );
}

const setErrorState = (setNewState, error) => {
    // this.state.images.forEach(image => {
    //     URL.revokeObjectURL(image.src);
    // });
    // setNewState({
    //     isLoaded: true,
    //     error,
    //     results: [],
    //     upload: null,
    //     images: null
    // });
}