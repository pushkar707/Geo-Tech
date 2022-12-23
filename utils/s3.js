if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
const S3 = require('aws-sdk/clients/s3')
const fs = require('fs')

const s3 = new S3({
    region:process.env.AWS_BUCKET_REGION,
    accessKeyId:process.env.AWS_ACCESS_KEY,
    secretAccessKey:process.env.AWS_SECRET_KEY
})

// Upload for s3

const multer = require('multer')
const multerS3 = require('multer-s3');

module.exports.upload = multer({
    storage: multerS3({
        s3: s3,
        acl: "public-read",
        bucket: process.env.AWS_BUCKET_NAME,
        key: function (req, file, cb) {
            const randNum = Date.now().toString()
            cb(null, randNum.slice(randNum.length-3,randNum.length-1)+'-'+file.originalname)
        }
    })
})

// UPLAODS FILE TO S3

// module.exports.uploadFile = async(file) => {
//     console.log(file);
//     const fileStream = fs.createReadStream(file.path)

//     const uploadParams = {
//         Bucket:process.env.AWS_BUCKET_NAME,
//         Body: fileStream,
//         Key:`${file.filename}.${file.originalname.split('.').slice(-1)[0]}`
//     }

//     return s3.upload(uploadParams).promise()
// }

// DOWNLAODS FILE FROM S3

module.exports.viewFile = fileKey => {
    const downloadParams = {
        Key:fileKey,
        Bucket:process.env.AWS_BUCKET_NAME
    }

    return s3.getObject(downloadParams).createReadStream()
}

module.exports.downloadFile = (fileKey) => {
    // const downloadParams = {
    //     Key:fileKey,
    //     Bucket:process.env.AWS_BUCKET_NAME,
    // }

    // return s3.getObject(downloadParams).promise()
    const URL = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${fileKey}`
    return URL
}