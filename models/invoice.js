const {Schema,model} = require('mongoose')

const invoiceSchema = {
    city:String,
    jobId:String,
    reportDate:String,
    letterDate:String,
    name:String,
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
        serviceTaxRate:Number,
    }],
    subTotal:Number,
    discount:Number,
    grandTotal:Number
}

module.exports = model('Invoice',invoiceSchema)