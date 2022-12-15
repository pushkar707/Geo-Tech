const {Schema,model} = require('mongoose')

const invoiceSchema = {
    city:String,
    jobId:String,
    reportDate:String,
    letterDate:String,
    name:String,
    clientTemp:String,
    refNo:String,
    consultantName:String,
    type:{
        type:String,
        enum:['normal','witness']
    },
    witnessName:String,
    witnessDate:String,
    discountPer:Number,
    client:{
        type:Schema.Types.ObjectId,
        ref:"Client"
    },
    inward:{
        type:Schema.Types.ObjectId,
        ref:'Inward'
    },
    order:[{
        material:String,
        test:String,
        quantity:Number,
        rate:Number,
        testId:{
            type:Schema.Types.ObjectId,
            ref:"Test"
        }
        // serviceTaxRate:Number,
    }],
    subTotal:Number,
    discount:Number,
    grandTotal:Number,
    image:String
}

module.exports = model('Invoice',invoiceSchema)