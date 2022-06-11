import React, { Component } from 'react';
import { Container } from 'react-bootstrap';
import ReactCrop from 'react-image-crop';
import {config} from "../../Constants";
import 'react-image-crop/dist/ReactCrop.css';

class UploadRectsEditor extends Component {
    constructor(props){
        super(props);
        this.state = {
            upload: this.props.upload,
            src: null,
            crop: { aspect: 16 / 9 },
            output: null
        }

        this.handleCropChange = this.handleCropChange.bind(this);
    }

    componentDidMount(){
        this.setState({ src: `${config.url.API_BASE_URL}/upload/view/${this.state.upload.id}` })
    }

    handleCropChange(event){
        this.setState({ crop: event });
    }

    render(){
        return(
            <div>
                <ReactCrop 
                    src={this.state.src}
                    crop={this.state.crop}
                    onChange={this.handleCropChange}>
                        <img id="source" src={this.state.src}/>
                </ReactCrop>
            </div>
        )
    }
}

export default UploadRectsEditor;
