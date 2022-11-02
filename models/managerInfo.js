const {Schema,model} = require('mongoose')

const cseInfoSchema = new Schema({
    city:String,
    orders:[{
        type:Schema.Types.ObjectId,
        ref:'Test'
    }],
    depatments:[{
        type:Schema.Types.ObjectId,
        ref:'Department'
    }]
})

module.exports = model('ManagerInfo',cseInfoSchema)