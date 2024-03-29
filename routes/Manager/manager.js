const express = require('express')
const router = express.Router({mergeParams:true})
const {loginRequired} = require('../../utils/loginMiddleware')
const {checkManagerVad} = require('../../utils/manager')
const Inward = require('../../models/Inward')
const InwardTest = require('../../models/InwardTest')
const wrapAsync = require('../../utils/wrapAsync')

router.route('/reports/new')
.get(loginRequired('manager'),checkManagerVad,wrapAsync(async(req,res)=>{
    let tests
    if(req.session.city=='VAD'){
        tests = await InwardTest.find({status:{$in:['approval pending','remarked approval pending']}})
    }else{
        tests = await InwardTest.find({city:req.session.city,status:{$in:['approval pending','remarked approval pending']}})
    }
    res.render('manager/reports',{tests})
}))

router.route('/reports/approved')
.get(loginRequired('manager'),wrapAsync(async(req,res)=>{
    let tests
    if(req.session.city=='VAD'){
        tests = await InwardTest.find({status:'approved'})
    }else{
        tests = await InwardTest.find({city:req.session.city,status:'approved'})
    }
    res.render('manager/reports',{tests})
}))

router.route('/reports/remarked')
.get(loginRequired('manager'),wrapAsync(async(req,res)=>{
    let tests
    if(req.session.city=='VAD'){
        tests = await InwardTest.find({status:{$in:['remarked','remarked approval pending']}})
    }else{
        tests = await InwardTest.find({city:req.session.city,status:{$in:['remarked','remarked approval pending']}})
    }
    res.render('manager/reports',{tests})
}))

router.route('/reports/cse-verified')
.get(loginRequired('manager'),wrapAsync(async(req,res)=>{
    let tests
    if(req.session.city=='VAD'){
        tests = await InwardTest.find({status:'cse-verified'})
    }else{
        tests = await InwardTest.find({city:req.session.city,status:'cse-verified'})
    }
    res.render('manager/reports',{tests})
}))

router.route('/test/:sampleDay/:sampleNo/approve')
.post(loginRequired('manager'),checkManagerVad,wrapAsync(async(req,res)=>{
    const {sampleDay,sampleNo} = req.params
    const tests = await InwardTest.find({sampleNo:`${sampleDay}/${sampleNo}`})
    const today = new Date()
    const approveDate = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`
    for (let test of tests){
        test.status = "approved"
        test.approveDate = approveDate
        await test.save()
    }
    const inward = await Inward.findById(tests[0].inward).populate("tests")
    let check = 0
    for (let test of inward.tests){
        if(test.status == "approved"){
            check+=1
        }
    }
    if(check == inward.tests.length){
        inward.status = 'approved'
        await inward.save()
    }
    res.redirect('/manager/reports/approved')
}))

router.route('/test/:sampleDay/:sampleNo/remark')
.post(loginRequired('manager'),checkManagerVad,wrapAsync(async(req,res)=>{
    const {sampleDay,sampleNo} = req.params
    const tests = await InwardTest.find({sampleNo:`${sampleDay}/${sampleNo}`})
    for(let test of tests){
        test.remarkedText = req.body.remarkedText
        test.status = 'remarked'
        test.previousReport = test.report
        test.report = ''
        await test.save()
    }
    await Inward.findByIdAndUpdate(tests[0].inward,{status:'remarked'})
    res.redirect('/manager/reports/remarked')
}))

router.route('/:id/pay')
.post(loginRequired('manager'),wrapAsync(async(req,res)=>{
    const {id} = req.params
    const test = await InwardTest.findById(id)
    test.payRequired = !test.payRequired
    await test.save()
    if(test.payRequired==false){
        await Inward.findByIdAndUpdate(test.inward,{payRequired:false})
    }else{
        const inward = await Inward.findById(test.inward).populate('tests')
        const check = inward.tests.find(test=>test.payRequired==false)
        if(check){
            inward.payRequired = false
        }else{
            inward.payRequired = true
        }
        await inward.save()
    }
    res.redirect('back')
}))

module.exports = router