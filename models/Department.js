const {Schema,model} = require("mongoose")
const bcrypt = require('bcrypt')

const departmentSchema = new Schema({
    name: String,
    email:{
        type:String,
        unique:true
    },
    password:String,
    city:String,
    inwards:[{
        sampleNo:String,
        reportNo:Number,
        material:String,
        price:Number,
        testName:String,
        test:{
            type:Schema.Types.ObjectId,
            ref:'Test'
        },
        inward:{
            type:Schema.Types.ObjectId,
            ref:'Inward'
        },
        status:String
    }],
    tests:[{
        type:Schema.Types.ObjectId,
        ref:"Test"
    }]
})

departmentSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
})

module.exports = model('Department',departmentSchema)