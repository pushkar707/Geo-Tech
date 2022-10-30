const express = require('express')
const router = express.Router({mergeParams:true})
const {loginRequired} = require('../../utils/loginMiddleware')
const Material = require('../../models/Material')
const Test = require('../../models/Test')
const wrapAsync = require('../../utils/wrapAsync')
const { validateMaterial,validateNewTest } = require('../../utils/cse')

router.route('/all')
.get(loginRequired('cse'),wrapAsync(async(req,res)=>{
    const materials = await Material.find({})
    res.render("all-tests.ejs",{materials})
}))

router.route('/new')
.post(loginRequired('cse'),validateMaterial,wrapAsync(async(req,res)=>{
    const {name} = req.body
    const material = new Material({name})
    await material.save()
    req.flash("success","Material Added Successfully")
    res.redirect('/material/all')
}))

router.route('/:id')
.get(loginRequired('cse'), wrapAsync(async(req,res)=>{
    const {id} = req.params
    const material = await Material.findById(id).populate('physical').populate('chemical').populate('other')
    if(!material){
        req.flash("error","No Such material found")
        res.redirect('/material/all')
    }
    const categories = ["physical","chemical","other"]
    res.render('add-tests',{material,categories})
}))
.put(loginRequired('cse'),validateMaterial,wrapAsync(async(req,res)=>{
    const {id} = req.params
    const {name} = req.body
    const material = await Material.findByIdAndUpdate(id,{name})
    if(!material){
        req.flash("error","No Such material found")
        res.redirect('/material/all')
    }
    req.flash("success","Material Name Changed")
    res.redirect('/material/all')
}))
.delete(loginRequired('cse'),wrapAsync(async(req,res)=>{
    const {id} = req.params
    const deleteMaterial = await Material.findByIdAndDelete(id)
    if(!deleteMaterial){
        req.flash("error","No Such material found")
        res.redirect('/material/all')
    }
    req.flash('success',`${deleteMaterial.name} deleted successfully`)
    res.redirect('/material/all')
}))

router.route('/add/:type/:id')
.put(loginRequired('cse'),validateNewTest,wrapAsync(async(req,res)=>{
    const {id,type} = req.params
    const test = new Test(req.body)
    test.material = id
    await test.save()
    try{
        let newMaterial
        if(type == "physical"){
            newMaterial = await Material.findByIdAndUpdate(id,{$push:{physical:test._id}})
        }else if(type == "chemical"){
            newMaterial = await Material.findByIdAndUpdate(id,{$push:{chemical:test._id}})
        }else if(type == "other"){
            newMaterial = await Material.findByIdAndUpdate(id,{$push:{other:test._id}})
        }
        req.flash("success",'Test added')
        await res.redirect('/material/'+id)
    }catch(e){
        req.flash("error","No Such material found")
        res.redirect('/material/all')
    }
}))

module.exports = router