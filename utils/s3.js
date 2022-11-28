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

// UPLAODS FILE TO S3


// DOWNLAODS FILE FROM S3