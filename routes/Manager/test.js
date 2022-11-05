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
    let city
    if(req.session.city == 'CITY - 2'){
        city = '2'
    } else if(req.session.city == 'CITY - 3'){
        city = '3'
    }else{
        city = 'VAD'
    }
    const tests = await Test.find({}).populate(`dept${city}`)
    res.render('manager/all-tests.ejs',{tests})
}))

router.route('/:testId/dept/:deptId')
.post(loginRequired('manager'),wrapAsync(async(req,res)=>{
    const {testId,deptId} = req.params
    const dept = await Department.findByIdAndUpdate(deptId,{$push:{tests:testId}})
    const test = await Test.findById(testId)
    test['dept'+req.session.city] = deptId
    await test.save()
    req.flash('success',"department assigned to test")
    res.redirect("/test/all")
}))

module.exports = router