const express = require('express')
const router = express.Router({mergeParams:true})
const {loginRequired} = require('../../utils/loginMiddleware')
const Client = require('../../models/Client')
const transporter = require('../../utils/nodeMailer')
const wrapAsync = require('../../utils/wrapAsync')

router.route('/all')
.get(loginRequired('client'),wrapAsync(async(req,res)=>{
    const client = await Client.findById(req.session.clientId).populate('inwards')
    let {inwards} = client
    res.render('client/all',{inwards})
}))

router.route('/processing')
.get(loginRequired('client'),wrapAsync(async(req,res)=>{
    const client = await Client.findById(req.session.clientId).populate('inwards')
    let {inwards} = client
    inwards = inwards.filter(inward => {
        return inward.status!='pending'
    })
    res.render('client/all',{inwards})
}))

router.route('/completed')
.get(loginRequired('client'),wrapAsync(async(req,res)=>{
    const client = await Client.findById(req.session.clientId).populate('inwards')
    let {inwards} = client
    inwards = inwards.filter(inward => {
        return inward.status=='approved' || inward.status == 'paid'
    })
    res.render('client/completed',{inwards})
}))


module.exports = router