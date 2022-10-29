const express = require('express')
const router = express.Router({mergeParams:true})
const {cseLoginRequired} = require('../../loginMiddleware')
const Material = require('../../models/Material')
const Test = require('../../models/Test')

router.route('/all')
.get(cseLoginRequired,async(req,res)=>{
    const materials = await Material.find({})
    res.render("all-tests.ejs",{materials})
})

router.route('/new')
.post(cseLoginRequired, async(req,res)=>{
    const {name} = req.body
    const material = new Material({name})
    await material.save()
    req.flash("success","Material Added Successfully")
    res.redirect('/material/all')
})

router.route('/:id')
.get(cseLoginRequired, async(req,res)=>{
    const {id} = req.params
    const material = await Material.findById(id).populate('physical').populate('chemical').populate('other')
    const categories = ["physical","chemical","other"]
    res.render('add-tests',{material,categories})
})
.put(cseLoginRequired,async(req,res)=>{
    const {id} = req.params
    const {name} = req.body
    await Material.findByIdAndUpdate(id,{name})
    req.flash("success","Material Name Changed")
    res.redirect('/material/all')
})
.delete(cseLoginRequired,async(req,res)=>{
    const {id} = req.params
    const deleteMaterial = await Material.findByIdAndDelete(id)
    req.flash('success',`${deleteMaterial.name} deleted successfully`)
    res.redirect('/material/all')
})

router.route('/add/:type/:id')
.put(cseLoginRequired,async(req,res)=>{
    console.log("hello");
    const {id,type} = req.params
    const test = new Test(req.body)
    test.material = id
    await test.save()
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
})

module.exports = router