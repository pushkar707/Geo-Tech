const {Schema,model} = require('mongoose')

const inwardSchema = new Schema({
    city:String,
    name:String,
    client:String,
    clientId:{
        type:Schema.Types.ObjectId,
        ref:'Client'
    },
    jobId:String,
    reportDate:String,
    letterDate:String,
    tests:[{
        type:Schema.Types.ObjectId,
        ref:'InwardTest'
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