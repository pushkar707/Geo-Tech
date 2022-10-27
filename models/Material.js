const mongoose = require('mongoose')

const testSchema = new mongoose.Schema({
    name:String,
    govt:Number,
    pvt:Number,
    thirdParty:Number
})

const materialSchema = new mongoose.Schema({
    name:String,
    physical:[testSchema],
    chemical:[testSchema],
    other:[testSchema]
})

module.exports = mongoose.model('Material',materialSchema)