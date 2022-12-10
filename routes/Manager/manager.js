const express = require('express')
const router = express.Router({mergeParams:true})
const {loginRequired} = require('../../utils/loginMiddleware')
const {checkManagerVad} = require('../../utils/manager')
const Department = require('../../models/Department')
const ManagerInfo = require('../../models/managerInfo')
const User = require('../../models/User')
const Inward = require('../../models/Inward')
const InwardTest = require('../../models/InwardTest')
const wrapAsync = require('../../utils/wrapAsync')

// router.route('.')

router.route('/test/:sampleDay/:sampleNo/approve')
.post(loginRequired('manager'),checkManagerVad,wrapAsync(async(req,res)=>{
    const {sampleDay,sampleNo} = req.params
    const tests = await InwardTest.find({sampleNo:`${sampleDay}/${sampleNo}`})
    const today = new Date()
    const approveDate = `${today.getMonth()+1}/${today.getDate()}/${today.getFullYear()}`
    for (let test of tests){
        test.status = "approved"
        test.approveDate = approveDate
        await test.save()
    }
    res.redirect('/department/inward/'+tests[0].inward)
}))

router.route('/test/:sampleDay/:sampleNo/remark')
.post(loginRequired('manager'),checkManagerVad,wrapAsync(async(req,res)=>{
    const {sampleDay,sampleNo} = req.params
    const tests = await InwardTest.find({sampleNo:`${sampleDay}/${sampleNo}`})
    for(let test of tests){
        test.remarkedText = req.body.remarkedText
        test.status = 'remarked'
        await test.save()
    }
    res.redirect('/department/inward/'+tests[0].inward)
}))

module.exports = router