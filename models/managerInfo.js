const {Schema,model} = require('mongoose')

const cseInfoSchema = new Schema({
    city:String,
    departments:[{
        type:Schema.Types.ObjectId,
        ref:'Department'
    }]
})

module.exports = model('ManagerInfo',cseInfoSchema)