const express = require('express')
const router = express.Router({mergeParams:true})
const {loginRequired} = require('../../utils/loginMiddleware')
const Material = require('../../models/Material')
const Test = require('../../models/Test')
const wrapAsync = require('../../utils/wrapAsync')
const { validateOldTest } = require('../../schemas/cse')

router.route('/:id')
.put(loginRequired('cse'),validateOldTest,wrapAsync(async(req,res)=>{
    const {id} = req.params
    const {name} = req.body
    const test = await Test.findByIdAndUpdate(id,{name})
    if(!test){
        req.flash("error","No such Test")
        return res.redirect('/material/'+test.material)
    }
    req.flash('success',"Test edited Successfully")
    res.redirect('/material/'+test.material)
}))
.delete(loginRequired('cse'),wrapAsync(async(req,res)=>{
    const {id} = req.params
    const test = await Test.findByIdAndDelete(id)
    if(!test){
        req.flash("error","No such Test")
        return res.redirect('/material/'+test.material)
    }
    const material = await Material.findByIdAndUpdate(test.material,{$pull:{physical:id}})
    if(!material){
        req.flash("error","No such Test")
        return res.redirect('/material/'+test.material)
    }
    req.flash("success","Test deleted successfully")
    res.redirect('/material/'+test.material) 
}))

module.exports = router