import API from "../../api";

export default class OCRCardsInfo {
    constructor(setNewState, getCurrentState,
                uploadId, problemId, type) {
        this.state = {
            setNewState,
            getCurrentState,
            uploadId,
            problemId,
            type
        }

        this.getOCRCardsInfo = this.getOCRCardsInfo.bind(this);
        this.loadImage = this.loadImage.bind(this);
        this.requestChoose = this.requestChoose.bind(this);
        this.setErrorState = this.setErrorState.bind(this);
        this.getResults = this.getResults.bind(this);
    }

    getResults() {
        const {setNewState} = this.state;
        const requestResult = this.requestChoose();

        Promise.all([requestResult()])
            .then(
                (result) => {
                    const results = result[0];
                    setNewState({results});
                },
                (error) => this.setErrorState(error)
            );
    }

    getOCRCardsInfo() {
        const {setNewState} = this.state;
        const requestResult = this.requestChoose();

        Promise.all([requestResult()])
            .then(
                (result) => {
                    const results = result[0];
                    if(results.length !== 0){
                        Promise.all([API.ocr.getUpload(results[0].id)])
                        .then(
                            (r) => {
                                setNewState({
                                    isLoaded: true,
                                    results,
                                    upload: r[0],
                                });
                                this.loadImage(r[0]);
                            }, (error) => this.setErrorState(error)
                        )
                    } else {
                        setNewState({
                            isLoaded: true,
                            results,
                            upload: null
                        });
                    }
                },
                (error) => this.setErrorState(error)
            );
    }

    loadImage(upload) {
        const {setNewState} = this.state;

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
                (error) => this.setErrorState(error)
            );
    }

    requestChoose() {
        const {uploadId, problemId, type} = this.state;

        switch (type) {
            case "upload_review":
                return () => API.uploads.getOCRResults(uploadId);
            case "problem_review":
                return () => API.problems.getOCRResults(problemId);
            default:
                return () => API.uploads.getOCRResults(uploadId);
        }
    }

    setErrorState(error) {
        const {setNewState, getCurrentState} = this.state;

        getCurrentState().images.forEach(image => {
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
}
