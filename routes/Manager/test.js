// ASSIGNING TESTS TO DEPARTMENTS

const express = require('express')
const router = express.Router({mergeParams:true})
const {loginRequired} = require('../../utils/loginMiddleware')
const Department = require('../../models/Department')
const Test = require('../../models/Test')
const wrapAsync = require('../../utils/wrapAsync')
const transporter = require('../../utils/nodeMailer')

router.route('/all')
.get(loginRequired('manager'),wrapAsync(async(req,res)=>{
    const {city} = req.session
    const tests = await Test.find({}).populate(`dept${city}`)
    const departments = await Department.find({city:req.session.city})
    res.render('manager/all-tests.ejs',{tests,city,departments})
}))

router.route('/:testId/dept/:deptId')
.post(loginRequired('manager'),wrapAsync(async(req,res)=>{
    const {testId,deptId} = req.params
    const {city} = req.session
    await Department.findOneAndUpdate({tests:testId},{$pull:{tests:testId}})
    if(deptId == 'none'){
        await Test.findByIdAndUpdate(testId,{$unset:{['dept'+city]:1}})
    }else{        
        const dept = await Department.findByIdAndUpdate(deptId,{$push:{tests:testId}})
        const test = await Test.findById(testId)
        test['dept'+city] = deptId
        await test.save()
    }
    req.flash('success',"Department Changed Successfully")
    res.redirect("/test/all")
}))

module.exports = router
