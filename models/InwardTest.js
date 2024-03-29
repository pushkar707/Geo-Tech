const {Schema,model} = require('mongoose')

const inwardTestSchema = new Schema({
    city:String,
    sampleNo:String,
    reportNo:Number,
    material:String,
    price:Number,
    testName:String,
    reportDate:String,
    letterDate:String,
    jobId:String,
    processDate:String,
    report:String,
    previousReport:String,
    worksheet:String,
    uploadDate:String,
    approveDate:String,
    remarkedText:String,
    payRequired:Boolean,
    type:{
        type:String,
        enum:['normal','witness']
    },
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