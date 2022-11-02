const express = require('express')
const router = express.Router({mergeParams:true})
const {loginRequired} = require('../../utils/loginMiddleware')
const Material = require('../../models/Material')
const Test = require('../../models/Test')
const wrapAsync = require('../../utils/wrapAsync')
const { validateOldTest } = require('../../schemas/cse')
const transporter = require('../../utils/nodeMailer')
const {checkCseVad} = require('../../utils/cse')

router.route('/:id')
.put(loginRequired('cse'),checkCseVad,validateOldTest,wrapAsync(async(req,res)=>{
    const {id} = req.params
    const {name} = req.body
    const test = await Test.findById(id)
    const oldName = test.name
    test.name = name
    await test.save()
    if(!test){
        req.flash("error","No such Test")
        return res.redirect('/material/'+test.material)
    }
    req.flash('success',"Test edited Successfully")
    res.redirect('/material/'+test.material)

    const mailOptions = {
        from: process.env.MAIL_ADDRESS,
        to: req.session.userEmail,
        subject: "Test Name Changed",
        html:`
        Old Material Name: ${oldName}<br><br>
        New Material Name: ${name}<br><br>
        Govt. Price: ${test.govt}<br><br>
        Private Price: ${test.pvt}<br><br>
        Third Party Price: ${test.thirdParty}<br><br>   
        `
    };
    transporter.sendMail(mailOptions);
}))
.delete(loginRequired('cse'),checkCseVad,wrapAsync(async(req,res)=>{
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

    const mailOptions = {
        from: process.env.MAIL_ADDRESS,
        to: req.session.userEmail,
        subject: "Deleted Test Successfully",
        html:`
        Follwing Test has been created:<br><br>
        Name: ${test.name}<br><br>
        Govt. Price: ${test.govt}<br><br>
        Private Price: ${test.pvt}<br><br>
        Third Party: ${test.thirdParty}<br><br>
        `
    };
    transporter.sendMail(mailOptions);
}))

module.exports = router