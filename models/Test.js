const {Schema,model} = require('mongoose')

const testSchema = new Schema({
    name:String,
    govt:Number,
    pvt:Number,
    thirdParty:Number,
    category:String,
    material: {
        type: Schema.Types.ObjectId,
        ref:"Material"
    }
})

module.exports = model('Test',testSchema)
