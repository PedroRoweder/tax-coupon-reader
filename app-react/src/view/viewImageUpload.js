import React, { Fragment, useState } from 'react';
import axios from 'axios'
//import getData from '../controller/dataController';

const ImageUpload = ({ onUpload, onLoad }) => {
    const [file, setFile] = useState('');
    const [fileName, setFileName] = useState('Choose File');
    const [uploadedFile, setUploadedFile] = useState({})
    
    const onChange = e => {
        setFile(e.target.files[0]);
        setFileName(e.target.files[0].name);
    }

    const onSubmit = e => {
        e.preventDefault();
        onLoad(false);
        onUpload();
        const myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/form-data');
        const formData = new FormData();
        formData.append('image', file);
        axios({
            method: 'post',
            url: 'http://localhost:5000/uploadAndRead',
            data: formData,
            headers: {'Content-Type': 'multipart/form-data' }
            })
            .then(function (response) {
                setFile('')
                setFileName('')
                onLoad(true)
                onUpload(response.data)
            })
            .catch(function (response) {
                //handle error
                console.log(response);
            });
    }

    return (
        <Fragment>
            <form onSubmit={onSubmit} id="formData">
                <div className="custom-file mb-4">
                    <input type="file" className="custom-file-input" id="customFile" onChange={onChange}/>
                    <label className="custom-file-label" htmlFor="customFile">{fileName}</label>
                </div>

                <input type="submit" value="Submit" className="btn btn-primary btn-block"/>
            </form>
        </Fragment>
    );
}

export default ImageUpload;