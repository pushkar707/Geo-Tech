const Joi = require('joi')
const AppError = require('./AppError')

module.exports.validateMaterial = (req,res,next)=> {
    const materialSchema = Joi.object({
        name:Joi.string().required()
    })
    const {error} = materialSchema.validate(req.body)
    if(error){
        const msg = error.details.map(el=>el.message).join(',')
        // throw new AppError(msg,400)
        req.flash('error',msg)
        res.redirect('/material/all')
    }else{
        next()
    }
}

// module.exports.validateNewTest = (req,res,next) => {
//     const testSchema = Joi.object({
//         name:Joi.string().required(),
//         govt:Joi.number().required(),
//         pvt:Joi.number().required(),
//         thirdParty:Joi.number().required(),
//         category:Joi.string().validate()
//     })
//     console.log(req.body);
//     const {error} = testSchema.validate(req.body)
//     if(error){
//         const msg = error.details.map(el=>el.message).join(',')
//         // throw new AppError(msg,400)
//         req.flash('error',msg)
//         res.redirect('/material/all')
//     }else{
//         next()
//     }
// }