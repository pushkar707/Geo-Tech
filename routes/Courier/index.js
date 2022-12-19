const express = require('express')
const router = express.Router({mergeParams:true})
const {loginRequired} = require('../../utils/loginMiddleware')
const Inward = require('../../models/Inward')
const transporter = require('../../utils/nodeMailer')
const wrapAsync = require('../../utils/wrapAsync')

router.route('/pending')
.get(loginRequired('courier'),wrapAsync(async(req,res)=>{
    const inwards = await Inward.find({dispatched:false,status:{$in:['cse-verfied','paid']}})
    res.render('courier/pending',{inwards})
}))

router.route('/:id/dispatch')
.post(loginRequired('courier'),wrapAsync(async(req,res)=>{
    const {id} = req.params
    const {trackingId,trackingCompany,courierDetails} = req.body
    await Inward.findByIdAndUpdate(id,{trackingId,trackingCompany,courierDetails,dispatched:true})
    res.redirect('/courier/dispatched')
}))

router.route('/dispatched')
.get(loginRequired('courier'),wrapAsync(async(req,res)=>{
    const inwards = await Inward.find({dispatched:true})
    res.render('courier/dispatched',{inwards})
}))

module.exports = router