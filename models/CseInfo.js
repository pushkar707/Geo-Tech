const {Schema,model} = require('mongoose')

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

module.exports = model('CseInfo',cseInfoSchema)