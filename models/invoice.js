const {Schema,model} = require('mongoose')

const invoiceSchema = {
    city:String,
    jobId:String,
    reportDate:Date,
    letterDate:Date,
    client:{
        type:Schema.Types.ObjectId,
        ref:"Client"
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