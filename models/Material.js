const {Schema,model} = require('mongoose')

const materialSchema = new Schema({
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
    cse:String
})

module.exports = model('Material',materialSchema)