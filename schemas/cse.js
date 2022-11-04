const Joi = require('joi')
const AppError = require('../utils/AppError')

module.exports.validateMaterial = (req,res,next)=> {
    const materialSchema = Joi.object({
        name:Joi.string().required()
    })
    const {error} = materialSchema.validate(req.body)
    if(error){
        const msg = error.details.map(el=>el.message).join(',')
        req.flash('error',msg)
        res.redirect('/material/all')
    }else{
        next()
    }
}

module.exports.validateNewTest = (req,res,next) => {
    const testSchema = Joi.object({
        name:Joi.string().required(),
        govt:Joi.number().required(),
        pvt:Joi.number().required(),
        thirdParty:Joi.number().required(),
        category:Joi.string().required()
    })
    console.log(req.body);
    const {error} = testSchema.validate(req.body)
    if(error){
        const msg = error.details.map(el=>el.message).join(',')
        req.flash('error',msg)
        res.redirect('/material/'+req.session.material_id)
    }else{
        next()
    }
}

module.exports.validateOldTest = (req,res,next)=> {
    const materialSchema = Joi.object({
        name:Joi.string().required(),
        govt:Joi.number().required(),
        pvt:Joi.number().required(),
        thirdParty:Joi.number().required()
    })
    const {error} = materialSchema.validate(req.body)
    if(error){
        const msg = error.details.map(el=>el.message).join(',')
        req.flash('error',msg)
        res.redirect('/material/'+req.session.material_id)
    }else{
        next()
    }
}