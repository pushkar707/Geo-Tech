const mongoose = require('mongoose')
const {Schema} = require('mongoose')

const cseInfoSchema = new Schema({
    city:String,
    materials:[{
        type:Schema.Types.ObjectId,
        ref:'Material'
    }],
    clients:[{
        type:Schema.Types.ObjectId,
        ref:'Client'
    }]
})

module.exports = mongoose.model('CseInfo',cseInfoSchema)