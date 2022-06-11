import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import ReactCrop from 'react-image-crop';
import { config } from "../../Constants";
import 'react-image-crop/dist/ReactCrop.css';

class UploadRectsEditor extends Component {
    constructor(props){
        super(props);
        this.state = {
            upload: this.props.upload,
            src: null,
            image: null,
            crop: null,
            existingRects: []
        }

        this.handleCropChange = this.handleCropChange.bind(this);
        this.handleImageChange = this.handleImageChange.bind(this);
        this.handleDeleteRect = this.handleDeleteRect.bind(this);
        this.addRectToUpload = this.addRectToUpload.bind(this);

        this.convertExistingRectsToImages = this.convertExistingRectsToImages.bind(this);
        this.cropImage = this.cropImage.bind(this);
    }

    componentDidMount(){
        this.setState({ src: `${config.url.API_BASE_URL}/upload/view/${this.state.upload.id}` });
    }

    handleCropChange = (event) => this.setState({ crop: event });
    handleImageChange = (event) => {
        
        event.target.crossOrigin = 'anonymous';
        this.state.image = event.target;
        this.convertExistingRectsToImages();
    }

    handleDeleteRect = () => {
        console.log("delete");
        //Delete rect method
    }

    addRectToUpload(){
        const rect = {
            x: this.state.crop.x,
            y: this.state.crop.y,
            width: this.state.crop.width,
            height: this.state.crop.height,
            type: "TEXT",
            status: ""
        }

        const upload = this.state.upload;
        upload.rects.push(rect);

        this.setState({ upload: upload, crop: null });
        this.convertExistingRectsToImages();
    }

    cropImage(crop){
        const canvas = document.createElement('canvas');
        const sourceImage = this.state.image;

        const scaleX = sourceImage.naturalWidth / sourceImage.width;
        const scaleY = sourceImage.naturalHeight / sourceImage.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');
    
        const pixelRatio = window.devicePixelRatio;
        canvas.width = crop.width * pixelRatio;
        canvas.height = crop.height * pixelRatio;
        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        ctx.imageSmoothingQuality = 'high';
    
        ctx.drawImage(
            sourceImage,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height,
        );
        
        //Next line should be -> const result = canvas.toDataUrl();
        const result = canvas.toDataURL();
        const existingRects = this.state.existingRects;
        existingRects.push(result);

        this.setState({ existingRects: existingRects });
    }

    convertExistingRectsToImages(){
        this.state.existingRects.length = 0;
        this.state.upload.rects.map((rect) => {
            this.cropImage(rect);
        });
    }

    render(){
        return(
            <div>
                <center>
                    <div>
                        <Button 
                            variant={'success'} 
                            onClick={this.addRectToUpload} 
                            style={{marginBottom: "10px"}}
                            disabled={this.state.crop !== null ? false : true}>Add text rect</Button>
                    </div>
                    <ReactCrop 
                        src={this.state.src}
                        crop={this.state.crop}
                        onChange={this.handleCropChange}>
                            <img id="source" onLoad={this.handleImageChange} src={this.state.src}/>
                    </ReactCrop>
                </center>
                {
                    this.state.existingRects.map((rect, index) =>
                        <div key={index} style={{marginTop: "10px"}}>
                            <img src={rect} style={{width: "50%", height: "50%"}}/>
                            <Button variant="outline-danger" onClick={this.handleDeleteRect}>Delete rect</Button>
                        </div>
                    )
                }
            </div>
        )
    }
}

export default UploadRectsEditor;
