const mongoose = require('mongoose')

const singleTestSchema = new mongoose.Schema({
    name:String,
    govt:Number,
    pvt:Number,
    thirdParty:Number
})

const testSchema = new mongoose.Schema({
    physical:[singleTestSchema],
    chemical:[singleTestSchema],
    other:[singleTestSchema],
    material:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Material"
    }
})

module.exports = mongoose.model('Test',testSchema)