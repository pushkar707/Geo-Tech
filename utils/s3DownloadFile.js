if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const aws = require('aws-sdk')

aws.config.update({
    secretAccessKey: process.env.AWS_SECRET_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    region: process.env.AWS_BUCKET_REGION,
});

const BUCKET = process.env.AWS_BUCKET_NAME
const s3 = new aws.S3();

module.exports.downloadFile = async(fileKey) => {
    const downloadParams = {
        Key:fileKey,
        Bucket:BUCKET
    }

    const res = await s3.getObject(downloadParams).promise()
    return res
}