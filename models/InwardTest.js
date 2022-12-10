const {Schema,model} = require('mongoose')

const inwardTestSchema = new Schema({
    sampleNo:String,
    reportNo:Number,
    material:String,
    price:Number,
    testName:String,
    reportDate:String,
    letterDate:String,
    jobId:String,
    processDate:String,
    report:[String],
    uploadDate:String,
    approveDate:String,
    remarkedText:String,
    previousReport:[String],
    payRequired:Boolean,
    dept:{
        type:Schema.Types.ObjectId,
        ref:'Department'
    },
    test:{
        type:Schema.Types.ObjectId,
        ref:'Test'
    },
    inward:{
        type:Schema.Types.ObjectId,
        ref:'Inward'
    },
    status:String,
    invoice:{
        type:Schema.Types.ObjectId,
        ref:'Invoice'
    }
})

module.exports = model('InwardTest',inwardTestSchema)