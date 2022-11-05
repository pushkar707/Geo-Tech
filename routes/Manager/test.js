const express = require('express')
const router = express.Router({mergeParams:true})
const {loginRequired} = require('../../utils/loginMiddleware')
const Department = require('../../models/Department')
const Test = require('../../models/Test')
const ManagerInfo = require('../../models/ManagerInfo')
const wrapAsync = require('../../utils/wrapAsync')
const transporter = require('../../utils/nodeMailer')

router.route('/all')
.get(loginRequired('manager'),wrapAsync(async(req,res)=>{
    const tests = await Test.find({})
    const departments = await Department.find({city:req.session.city}).populate('tests')
    res.render('manager/all-tests.ejs',{tests,departments})
}))

module.exports = router