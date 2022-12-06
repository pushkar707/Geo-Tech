if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
const S3 = require('aws-sdk/clients/s3')
const crypto = require('crypto')
const fs = require('fs')

const s3 = new S3({
    region:process.env.AWS_BUCKET_REGION,
    accessKeyId:process.env.AWS_ACCESS_KEY,
    secretAccessKey:process.env.AWS_SECRET_KEY
})

// UPLAODS FILE TO S3

module.exports.uploadFile = (file) => {
    const fileStream = fs.createReadStream(file.path)
    const randNum = Math.floor(Math.random()*100)

    const uploadParams = {
        Bucket:process.env.AWS_BUCKET_NAME,
        Body: fileStream,
        Key:file.filename
    }

    return s3.upload(uploadParams).promise()
}

// DOWNLAODS FILE FROM S3

module.exports.downloadFile = fileKey => {
    const downloadParams = {
        Key:fileKey,
        Bucket:process.env.AWS_BUCKET_NAME
    }

    return s3.getObject(downloadParams).createReadStream()
}