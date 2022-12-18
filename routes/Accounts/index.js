const express = require('express')
const router = express.Router({mergeParams:true})
const {loginRequired} = require('../../utils/loginMiddleware')
const Inward = require('../../models/Inward')
const transporter = require('../../utils/nodeMailer')
const wrapAsync = require('../../utils/wrapAsync')

router.route('/pending')
.get(loginRequired('accounts'),wrapAsync(async(req,res)=>{
    const inwards = await Inward.find({status:'cse-verified'})
    res.render('accounts/pending',{inwards})
}))

module.exports = router