const express = require('express')
const router = express.Router({mergeParams:true})
const {loginRequired} = require('../../utils/loginMiddleware')
const Client = require('../../models/Client')
const Material = require('../../models/Material')
const Inward = require('../../models/Inward')
const Invoice = require('../../models/Invoice')
const Test = require('../../models/Test')
const Other = require('../../models/Other')
const wrapAsync = require('../../utils/wrapAsync')

// new inward GET and POST routes /new, new/:id, new/:id/save
// POST,PUT,DELETE routes to add,remove and delete tests from inward /:inwardId/:sampleNo
// pending inwards GET
// performa GET
// Show page for inward /:id GET

router.route('/new')
.get(loginRequired('cse'),wrapAsync(async(req,res)=>{
    if(req.cookies.inward){
        return res.redirect('/inward/new/tests')
    }
    const {city} = req.session
    const clients = await Client.find({cse:city})
    res.render('cse/inwards/new-inward',{clients})
}))
.post(loginRequired('cse'),wrapAsync(async(req,res)=>{
    const {city} = req.session
    const {client,inward} = req.body
    const currClient = await Client.findById(client)
    const start = new Date('04/01/2022')
    const today = new Date()
    const daysDiff = Math.ceil(Math.abs(today-start)/(1000*60*60*24))
    let jobOfTheDay = 0
    if(await Inward.count() > 0){
        lastRecord = await Inward.find({}).skip(await Inward.count() - 1)
        lastDate = lastRecord[0].jobId.split('/')[2]
        if(lastDate==daysDiff){
            jobOfTheDay = Number(lastRecord[0].jobId.split('/')[3])+1
        }
    }
    const jobId = `${city}/${currClient.clientCode}/${daysDiff}/${jobOfTheDay}`
    const reportDate = `${today.getMonth()+1}/${today.getDate()}/${today.getFullYear()}`
    const newInward = new Inward({name:inward,city,client:currClient.name,jobId,tests:[],reportDate})
    res.cookie('inward',{...newInward['_doc']});
    res.cookie('retailType',currClient.retailType)
    res.redirect('/inward/new/tests')
}))

router.route('/new/tests')
.get(loginRequired('cse'),wrapAsync(async(req,res)=>{
    const materials = await Material.find({}).populate('physical').populate('chemical').populate('other')
    res.render('cse/inwards/add-tests',{inward:req.cookies.inward,materials})
}))
.post(loginRequired('cse'),wrapAsync(async(req,res)=>{
    let inward = req.cookies.inward
    let sampleOfTheDay = req.cookies.sampleOfTheDay || 0;
    let reportNo = req.cookies.reportNo || 0
    const start = new Date('04/01/2022')
    const today = new Date()
    const daysDiff = Math.ceil(Math.abs(today-start)/(1000*60*60*24))
    
    if(await Inward.count() > 0 && !req.cookies.sampleOfTheDay){
        lastRecord = await Inward.find({}).populate('tests').skip(await Inward.count() - 1)
        lastDate = lastRecord[0].tests[lastRecord[0].tests.length-1].sampleNo.split('/')[0]
        if(lastDate==daysDiff){
            sampleOfTheDay = Number(lastRecord[0].tests[lastRecord[0].tests.length-1].sampleNo.split('/')[1])
            reportNo = Number(lastRecord[0].tests[lastRecord[0].tests.length-1].reportNo)
            // res.cookie()
        }
    }
    let allTests = req.body.tests
    if(!Array.isArray(allTests)){
        allTests = [allTests]
    }
    let newAllTests = []
    console.log("all tests: ",allTests);
    for( test in allTests){
        newAllTests.push(await Test.findById(allTests[test]))
    }
    console.log(newAllTests);
    newAllTests.forEach(test => {
        const price = test[req.cookies.retailType]
        for (let i = 0; i < req.body.quantity; i++) {
            sampleOfTheDay++; reportNo++;
            const sampleNo = `${daysDiff}/${sampleOfTheDay}`
            const newTest = {material:req.body.material,test:test._id,testName:test.name,price,sampleNo,reportNo}
            inward = {...inward,tests:[...inward.tests,newTest]}
        }
    });
    res.cookie('inward',inward)
    res.cookie('sampleOfTheDay',sampleOfTheDay)
    res.cookie('reportNo',reportNo)
    return res.redirect('/inward/new/tests')
}))

router.route('/new/:reportNo')
.delete(loginRequired('cse'),(req,res)=>{
    let inward = req.cookies.inward
    const newTests = inward.tests.filter(test=>{
        return test.reportNo != req.params.reportNo
    })
    inward = {...inward,tests:newTests}
    res.cookie('inward',inward)
    return res.redirect('/inward/new/tests')
})
.put(loginRequired('cse'),(req,res)=>{
    const {price} = req.body
    let inward = req.cookies.inward
    const newTests = inward.tests.filter(test=>{
        if(test.reportNo == req.params.reportNo){
            test.price = price
        }
        return test
    })
    inward = {...inward,tests:newTests}
    res.cookie('inward',inward)
    return res.redirect('/inward/new/tests')
})

router.route('/new/:id')
.post(loginRequired('cse'),wrapAsync(async(req,res)=>{
    const inward = new Inward(req.cookies.inward)
    await inward.save()
    res.clearCookie('inward')
    res.clearCookie('sampleOfTheDay')
    res.clearCookie('reportNo')
    res.clearCookie('retailType')
    res.redirect('/inward/new/'+req.params.id)
}))

router.route('/new/:id')
.get(loginRequired('cse'),wrapAsync(async(req,res)=>{
    const {id} = req.params
    const {city} = req.session
    const inward = await Inward.findById(id)
    const {jobId,reportDate,letterDate} = inward
    const client = await Client.findOne({name:inward.client})
    const other = await Other.findOne({})
    const {serviceTax} = other
    const order = []
    let subTotal = 0
    inward.tests.forEach(testi=>{
        const {material,testName,price,test} = testi
        const currTest = order.find(testj => String(testj.testId) == String(testi.test))
        const serviceTaxRate = Math.floor(price+((serviceTax/100)*price))
        subTotal+=serviceTaxRate
        if(!currTest){
            const newTest = {material,rate:price,serviceTaxRate,test:testName,testId:test,quantity:1}
            order.push(newTest)
        }
        else{
            order.filter(testi => {
                if(testi == currTest){
                    return testi.quantity+=1
                }
                return testi
            })
        }
    })
    const discount = Math.floor(subTotal*(client.discount/100))
    const grandTotal = Math.floor(subTotal-discount + (18/100)*(subTotal-discount))
    const invoice = new Invoice({city,jobId,reportDate,letterDate,order,client:client._id,inward:inward._id,subTotal,discount,grandTotal})
    invoice.inward = inward._id
    await invoice.save()
    inward.invoice = invoice._id
    await inward.save()
    console.log(invoice);
    res.render('cse/inwards/confirm-inward',{inward,client,order,subTotal,grandTotal,discount}) 
}))

router.route('/pending')
.get(loginRequired('cse'),wrapAsync(async(req,res)=>{
    const inwards = await Inward.find({pending:true})
    res.render('cse/inwards/pending',{inwards})
}))

router.route('/test')
.get((req,res)=>{
    res.send(req.cookies)
})

module.exports = router