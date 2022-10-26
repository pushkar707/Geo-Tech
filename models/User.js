const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        unique:true
    },
    password:String,
    name:String,
    position:String
})

userSchema.statics.findAndValidate = async function (email, password) {
    const foundUser = await this.findOne({ email });
    if(foundUser){
        const isValid = await bcrypt.compare(password, foundUser.password);
        return isValid ? foundUser : false;
    }else{
        return false
    }
}

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
})

module.exports = mongoose.model('User',userSchema)