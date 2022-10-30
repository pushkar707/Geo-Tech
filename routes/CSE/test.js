const express = require('express')
const router = express.Router({mergeParams:true})
const {loginRequired} = require('../../loginMiddleware')
const Material = require('../../models/Material')
const Test = require('../../models/Test')
const wrapAsync = require('../../wrapAsync')

router.route('/:id')
.put(loginRequired('cse'),wrapAsync(async(req,res)=>{
    const {id} = req.params
    const {name} = req.body
    const test = await Test.findByIdAndUpdate(id,{name})
    req.flash('success',"Test edited Successfully")
    res.redirect('/material/'+test.material)
}))
.delete(loginRequired('cse'),wrapAsync(async(req,res)=>{
    const {id} = req.params
    const test = await Test.findByIdAndDelete(id)
    await Material.findByIdAndUpdate(test.material,{$pull:{physical:id}})
    req.flash("success","Test deleted successfully")
    res.redirect('/material/'+test.material) 
}))

module.exports = router