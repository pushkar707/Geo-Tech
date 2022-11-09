const {Schema,model} = require('mongoose')

const otherSchema = new Schema({
    serviceTax:Number
})

module.exports = model('Other',otherSchema)