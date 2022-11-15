const {Schema,model} = require('mongoose')

const inwardTestSchema = new Schema({
    sampleNo:String,
    reportNo:Number,
    material:String,
    price:Number,
    testName:String,
    test:{
        type:Schema.Types.ObjectId,
        ref:'Test'
    },
    inward:{
        type:Schema.Types.ObjectId,
        ref:'Inward'
    },
    status:String
})