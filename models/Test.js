const mongoose = require('mongoose')
const {Schema} = require('mongoose')

const testSchema = new Schema({
    name:String,
    govt:Number,
    pvt:Number,
    thirdParty:Number,
    material: {
        type: Schema.Types.ObjectId,
        ref:"Material"
    }
})

module.exports = mongoose.model('Test',testSchema)
