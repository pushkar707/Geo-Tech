const {Schema,model} = require('mongoose')

const inwardSchema = new Schema({
    city:String,
    name:String,
    client:String,
    jobId:String,
    reportDate:Date,
    letterDate:Date,
    tests:[{
        sampleNo:Number,
        reportNo:Number,
        material:String,
        price:Number,
        testName:String,
        test:{
            type:Schema.Types.ObjectId,
            ref:'Test'
        }
    }],
    invoice:{
        type:Schema.Types.ObjectId,
        ref:'Invoice'
    },
    pending:{
        type:Boolean,
        default:true
    }
})

module.exports = model('Inward',inwardSchema)