const mongoose = require('mongoose')
const {Schema} = require('mongoose')

const materialSchema = new mongoose.Schema({
    name:String,
    physical:[{
        type: Schema.Types.ObjectId,
        ref:'Test'
    }],
    chemical:[{
        type: Schema.Types.ObjectId,
        ref:'Test'
    }],
    other:[{
        type: Schema.Types.ObjectId,
        ref:'Test'
    }],
})

module.exports = mongoose.model('Material',materialSchema)