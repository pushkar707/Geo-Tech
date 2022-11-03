const express = require('express')
const router = express.Router({mergeParams:true})
const {loginRequired} = require('../../utils/loginMiddleware')
const Material = require('../../models/Material')
const Test = require('../../models/Test')
const CseInfo = require('../../models/CseInfo')
const wrapAsync = require('../../utils/wrapAsync')
const { validateMaterial,validateNewTest } = require('../../schemas/cse')
const transporter = require('../../utils/nodeMailer')
const { checkCseVad } = require('../../utils/cse')

router.route('/all')
.get(loginRequired('cse'),wrapAsync(async(req,res)=>{
    const materials = await Material.find({})
    res.render("all-tests.ejs",{materials})
}))

router.route('/new')
.post(loginRequired('cse'),validateMaterial,wrapAsync(async(req,res)=>{
    const {name} = req.body
    const {city} = req.session
    const material = new Material({name})
    material.cse = city
    await material.save()
    await CseInfo.findOneAndUpdate({city},{$push:{materials:material._id}})
    req.flash("success","Material Added Successfully")
    res.redirect('/material/all')

    const mailOptions = {
        from: process.env.MAIL_ADDRESS,
        to: req.session.mainEmail,
        subject: "Created New Material",
        html:`
        Follwing Material has been created by CSE ${req.session.city}:<br><br>
        Name: ${name}
        `
    };
    transporter.sendMail(mailOptions);
}))

router.route('/:id')
.get(loginRequired('cse'), wrapAsync(async(req,res)=>{
    const {id} = req.params
    const material = await Material.findById(id).populate('physical').populate('chemical').populate('other')
    if(!material){
        req.flash("error","No Such material found")
        res.redirect('/material/all')
    }
    req.session.material_id = id
    const categories = ["physical","chemical","other"]
    res.render('add-tests',{material,categories})
}))
.put(loginRequired('cse'),checkCseVad,validateMaterial,wrapAsync(async(req,res)=>{
    const {id} = req.params
    const {name} = req.body
    const material = await Material.findById(id)
    const oldName = material.name
    material.name = name
    await material.save()
    if(!material){
        req.flash("error","No Such material found")
        return res.redirect('/material/all')
    }
    req.flash("success","Material Name Changed")
    res.redirect('/material/all')

    const mailOptions = {
        from: process.env.MAIL_ADDRESS,
        to: req.session.mainEmail,
        subject: "Edited Material Name",
        html:`
        Old Material Name: ${oldName}<br><br>
        New Material Name: ${name}<br><br>
        `
    };
    transporter.sendMail(mailOptions);
}))
.delete(loginRequired('cse'),checkCseVad,wrapAsync(async(req,res)=>{
    const {id} = req.params
    const deleteMaterial = await Material.findByIdAndDelete(id)
    if(!deleteMaterial){
        req.flash("error","No Such material found")
        return res.redirect('/material/all')
    }
    req.flash('success',`${deleteMaterial.name} deleted successfully`)
    res.redirect('/material/all')

    const mailOptions = {
        from: process.env.MAIL_ADDRESS,
        to: req.session.mainEmail,
        subject: "Deleted Material Successfully",
        html:`
        Follwing Material has been created:<br><br>
        Name: ${deleteMaterial.name}
        `
    };
    transporter.sendMail(mailOptions);
}))

router.route('/add/:type/:id')
.put(loginRequired('cse'),checkCseVad,validateNewTest,wrapAsync(async(req,res)=>{
    const {id,type} = req.params
    const test = new Test(req.body)
    test.material = id
    await test.save()
    let newMaterial
    try{
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

    const mailOptions = {
        from: process.env.MAIL_ADDRESS,
        to: req.session.mainEmail,
        subject: "Deleted Material Successfully",
        html:`
        Follwing Test has been added to material ${newMaterial.name}:<br><br>
        Name: ${test.name}<br><br>
        Govt. Price: ${test.govt}<br><br>
        Private Price: ${test.pvt}<br><br>
        Third Party Price: ${test.thirdParty}<br><br>   
        `
    };
    transporter.sendMail(mailOptions);
}))

module.exports = router