const {Schema,model} = require('mongoose')

const testSchema = new Schema({
    name:String,
    govt:Number,
    pvt:Number,
    thirdParty:Number,
    category:String,
    material:String,
    materialId:{
        type:Schema.Types.ObjectId,
        ref:'Material'
    },
    deptVAD:{
        type:Schema.Types.ObjectId,
        ref:'Department'
    },
    'dept2':{
        type:Schema.Types.ObjectId,
        ref:"Department"
    },
    "dept3":{
        type:Schema.Types.ObjectId,
        ref:'Department'
    }
})

module.exports = model('Test',testSchema)
