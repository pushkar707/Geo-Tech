const express = require('express')
const router = express.Router({mergeParams:true})
const {loginRequired} = require('../../utils/loginMiddleware')
const Inward = require('../../models/Inward')
const transporter = require('../../utils/nodeMailer')
const wrapAsync = require('../../utils/wrapAsync')
const InwardTest = require('../../models/InwardTest')

router.route('/pending')
.get(loginRequired('accounts'),wrapAsync(async(req,res)=>{
    const inwards = await Inward.find({status:'cse-verified'})
    res.render('accounts/pending',{inwards})
}))

router.route('/payment/:id')
.post(loginRequired('accounts'),wrapAsync(async(req,res)=>{
    const {id} = req.params
    const today = new Date()
    const payDate = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`
    const inward = await Inward.findByIdAndUpdate(id,{status:'paid',payDate}).populate('tests')
    for (let test of inward.tests){
        test.status == 'paid'
        await test.save()
    }
    res.redirect('back')
}))

router.route('/paid')
.get(loginRequired('accounts'),wrapAsync(async(req,res)=>{
    const inwards = await Inward.find({status:'paid'})
    res.render('accounts/paid',{inwards})
}))

module.exports = router