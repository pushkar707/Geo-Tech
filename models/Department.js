const {Schema,model} = require("mongoose")
const bcrypt = require('bcrypt')

const departmentSchema = new Schema({
    name: String,
    email:String,
    password:String,
    city:String,
    // manager:{
    //     type:Schema.Types.ObjectId,
    //     ref:'ManagerInfo'
    // },
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