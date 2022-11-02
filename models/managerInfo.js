const {Schema,model} = require('mongoose')

const cseInfoSchema = new Schema({
    city:String,
    tests:[{
        type:Schema.Types.ObjectId,
        ref:'Test'
    }],
    depatments:[{
        type:Schema.Types.ObjectId,
        ref:'Department'
    }]
})

module.exports = model('ManagerInfo',cseInfoSchema)