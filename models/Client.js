const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const clientSchema = new mongoose.Schema({
    clientCode:Number,
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
        enum:['govt','pvt','thirdParty']
    },
    serviceTax:Boolean,
    taxType:{
        type:String,
        enum:['gst','igst']
    },
    contactPerson:{
        name:String,
        mobile:String,
        accountantName:String,
        accountantNumber:String,
        managerName:String,
        managerNumber:String
    },
    remarks:String,
    cse:String,
    orders:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Order'
    }]
})

clientSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
})

module.exports = mongoose.model('Client',clientSchema)