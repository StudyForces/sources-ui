import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import ReactCrop from 'react-image-crop';
import {config} from "../../Constants";
import 'react-image-crop/dist/ReactCrop.css';

class UploadRectsEditor extends Component {
    constructor(props){
        super(props);
        this.state = {
            upload: this.props.upload,
            src: null,
            image: null,
            crop: { aspect: 16 / 9 },
            output: null
        }

        this.handleCropChange = this.handleCropChange.bind(this);
        this.handleImageChange = this.handleImageChange.bind(this);
        this.addRect = this.addRect.bind(this);
        this.addRectToUpload = this.addRectToUpload.bind(this);
        this.cropImage = this.cropImage.bind(this);
    }

    componentDidMount(){
        this.setState({ src: `${config.url.API_BASE_URL}/upload/view/${this.state.upload.id}` });
    }

    handleCropChange = (event) => this.setState({ crop: event });
    handleImageChange = (event) => this.setState({ image: event.target });

    addRect(){
        this.addRectToUpload();
        this.cropImage();
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
        this.setState({ upload: upload });
        console.log(this.state.upload);
    }

    cropImage(){
        const crop = this.state.crop;
        const canvas = document.createElement('canvas');
        const sourceImage = this.state.image;

        const scaleX = sourceImage.naturalWidth / (sourceImage.width * 2);
        const scaleY = sourceImage.naturalHeight / (sourceImage.height * 2);
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
        
        const result = canvas.toDataURL('image/jpeg');
        this.setState({ output: result });
      };

    render(){
        return(
            <div>
                <ReactCrop 
                    src={this.state.src}
                    crop={this.state.crop}
                    onChange={this.handleCropChange}>
                        <img id="source" onLoad={this.handleImageChange} src={this.state.src}/>
                </ReactCrop>
                <Button variant={'success'}  onClick={this.addRect}>Add text rect</Button>
                <img crossOrigin={'Anonymous'} src={this.state.output}/>
            </div>
        )
    }
}
//
export default UploadRectsEditor;
