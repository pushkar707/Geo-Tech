const {Schema,model} = require('mongoose')

const inwardSchema = new Schema({
    city:String,
    name:String,
    clientType:{
        type:String,
        enum:['govt','pvt','thirdParty']
    },
    client:String,
    clientId:{
        type:Schema.Types.ObjectId,
        ref:'Client'
    },
    clientTemp:String,
    refNo:String,
    consultantName:String,
    type:{
        type:String,
        enum:['normal','witness']
    },
    witnessName:String,
    witnessDate:String,
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
    status:String
})

module.exports = model('Inward',inwardSchema)