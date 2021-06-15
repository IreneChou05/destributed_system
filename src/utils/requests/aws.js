import AWS from 'aws-sdk';
// import {file_upload_url} from "@/config/api.js"
// import Vue from "vue"

// let vue = new Vue()

//创建 aws 服务
var s3 = new AWS.S3();
export function fileUpload(file) {
    var uploadParams = { 
      Bucket: 'amld-project/storage/upload',
      Key: file.name, //图片名称
      Body: file,// file
    };
    var File = new Promise(function(resolve,reject) {
        //做一些异步操作
        s3.upload(uploadParams, function(err, data) {
                console.warn(data)
            if (err) {
                console.log("Error", err);
                reject(data)
            }
            if (data) {
                resolve(data);
            }
        });
    });
    return File
}