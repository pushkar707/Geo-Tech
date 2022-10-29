const mongoose = require('mongoose')

const clientSchema = new mongoose.Schema({
    name:String,
    email:String,
    telephone:String,
    password:String,
    alias:String,
    address:String,
    city:String,
    discount:Number,
    retailType:{
        type:String,
        enum:['Government,Private,3rd Party']
    },
    serviceTax:Boolean,
    taxType:{
        type:String,
        enum:['GST,IGST']
    },
    contactPerson:{
        name:String,
        mobile:String,
        accountantName:String,
        accountantNumber:String,
        managerName:String,
        managerNumber:String
    },
    remarks:String
})

module.exports = mongoose.model('Client',clientSchema)