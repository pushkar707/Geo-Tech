const express = require('express')
const router = express.Router({mergeParams:true})
const {loginRequired} = require('../../utils/loginMiddleware')
const Client = require('../../models/Client')
const Material = require('../../models/Material')
const Inward = require('../../models/Inward')
const Invoice = require('../../models/invoice')
const Test = require('../../models/Test')
const InwardTest = require('../../models/InwardTest')
const Other = require('../../models/Other')
const wrapAsync = require('../../utils/wrapAsync')
const Department = require('../../models/Department')
// const multer = require('multer')
const {upload} = require('../../utils/s3')
// const upload = multer({dest:'uploads/'})
// const {uploadFile,downloadFile} = require('../../utils/s3')


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
    const {client,inward,clientTemp,refNo,witnessName,type,witnessDate,consultantName} = req.body
    const currClient = await Client.findById(client)
    const start = new Date('04/01/2022')
    const today = new Date()
    const daysDiff = Math.ceil(Math.abs(today-start)/(1000*60*60*24))
    let jobOfTheDay = 1
    if(await Inward.count() > 0){
        lastRecord = await Inward.find({}).skip(await Inward.count() - 1)
        lastDate = lastRecord[0].jobId.split('/')[2]
        if(lastDate==daysDiff){
            jobOfTheDay = Number(lastRecord[0].jobId.split('/')[3])+1
        }
    }
    const jobId = `${city}/${currClient.clientCode}/${daysDiff}/${jobOfTheDay}`
    const reportDate = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`
    const newInward = new Inward({name:inward,city,client:currClient.name,clientId:client,jobId,tests:[],reportDate,clientTemp,refNo,witnessName,type,witnessDate,consultantName})
    res.cookie('inward',{...newInward['_doc']});
    res.cookie('retailType',currClient.retailType)
    res.redirect('/inward/new/tests')
}))

router.route('/new/tests')
.get(loginRequired('cse'),wrapAsync(async(req,res)=>{
    const materials = await Material.find({}).populate('physical').populate('chemical').populate('other')
    res.render('cse/inwards/add-tests',{inward:req.cookies.inward,materials,existing:false})
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
        }
    }
    let allTests = req.body.tests
    if(!Array.isArray(allTests)){
        allTests = [allTests]
    }
    let newAllTests = []
    for( test in allTests){
        newAllTests.push(await Test.findById(allTests[test]))
    }
    for (let i = 0; i < req.body.quantity; i++) {
        sampleOfTheDay++; reportNo++;
        newAllTests.forEach(test => {
            const price = test[req.cookies.retailType]
            const sampleNo = `${daysDiff}/${sampleOfTheDay}`
            const newTest = {material:req.body.material,test:test._id,testName:test.name,price,sampleNo,reportNo,dept:test['dept'+req.session.city]}
            inward = {...inward,tests:[...inward.tests,newTest]}
        }
    )};
    res.cookie('inward',inward)
    res.cookie('sampleOfTheDay',sampleOfTheDay)
    res.cookie('reportNo',reportNo)
    return res.redirect('/inward/new/tests')
}))

router.route('/clear')
.post(loginRequired('cse'),wrapAsync(async(req,res)=>{
    res.clearCookie('inward')
    res.clearCookie('sampleOfTheDay')
    res.clearCookie('reportNo')
    res.clearCookie('retailType')
    res.redirect('/inward/new')
}))

router.route('/new/:reportNo/:test')
.delete(loginRequired('cse'),(req,res)=>{
    let inward = req.cookies.inward
    const newTests = inward.tests.filter(test=>{
        if (test.reportNo == req.params.reportNo){
            if(test.testName != req.params.test){
                return test
            }
        }else{
            return test
        }
    })
    inward = {...inward,tests:newTests}
    if(inward.tests.length){
        res.cookie('sampleOfTheDay',inward.tests[inward.tests.length-1].reportNo)
        res.cookie('reportNo',inward.tests[inward.tests.length-1].reportNo)
    }else{
        res.cookie('sampleOfTheDay',req.cookies.sampleOfTheDay-1)
        res.cookie('reportNo',req.cookies.reportNo-1)
    }
    res.cookie('inward',inward)
    return res.redirect('/inward/new/tests')
})
// .put(loginRequired('cse'),(req,res)=>{
//     const {price} = req.body
//     let inward = req.cookies.inward
//     const newTests = inward.tests.filter(test=>{
//         if(test.reportNo == req.params.reportNo){
//             test.price = price
//         }
//         return test
//     })
//     inward = {...inward,tests:newTests}
//     res.cookie('inward',inward)
//     return res.redirect('/inward/new/tests')
// })

router.route('/new/save')
.post(loginRequired('cse'),wrapAsync(async(req,res)=>{
    const {city} = req.session
    const {name,client,clientId,jobId,reportDate,pending,tests,clientTemp,refNo,witnessName,type,witnessDate,consultantName} = req.cookies.inward
    const inward = new Inward({clientType:req.cookies.retailType,name,client,clientId,jobId,reportDate,status:'pending',city,clientTemp,refNo,witnessName,type,witnessDate,consultantName})
    const newInvoice = new Invoice()
    await newInvoice.save()
    for (let test of tests){
        const newTest = new InwardTest({...test,inward:inward._id,status:'pending',reportDate,jobId,invoice:newInvoice._id,payRequired:true,type,city:req.session.city})
        await newTest.save()
        inward.tests.push(newTest._id)
        // const dept = await Department.findByIdAndUpdate(test.dept,{$push:{inwards:newTest._id}})
    }
    res.clearCookie('inward')
    res.clearCookie('sampleOfTheDay')
    res.clearCookie('reportNo')
    res.clearCookie('retailType')
    const {letterDate} = inward
    const newClient = await Client.findById(clientId)
    const order = []
    let subTotal = 0
    const other = await Other.findOne({})
    const {serviceTax} = other
    tests.forEach(testi=>{
        const {material,testName,price,test} = testi
        const currTest = order.find(testj => String(testj.testId) == String(test))
        
        const serviceTaxRate = Math.floor(price+((serviceTax/100)*price))
        subTotal+=serviceTaxRate
        if(!currTest){
            const newTest = {material,rate:price,test:testName,testId:test,quantity:1}
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
    const discount = Math.floor(subTotal*(newClient.discount/100))
    const grandTotal = Math.floor(subTotal-discount + (18/100)*(subTotal-discount))
    const invoice = await Invoice.findByIdAndUpdate(newInvoice._id,{name:inward.name,city,jobId,reportDate,letterDate,order,client:newClient._id,discountPer:newClient.discount,clientTemp,refNo,consultantName,type,witnessName,witnessDate,subTotal,discount,grandTotal,inward:inward._id})
    // invoice = {name:inward.name,city,jobId,reportDate,letterDate,order,client:newClient._id,discountPer:newClient.discount,clientTemp,refNo,consultantName,type,witnessName,witnessDate,subTotal,discount,grandTotal,inward:inward._id}
    // const invoice = new Invoice({city,jobId,reportDate,letterDate,order,client:newClient._id,discountPer:newClient.discount,clientTemp,refNo,consultantName,type,witnessName,witnessDate,subTotal,discount,grandTotal})
    // invoice.inward = inward._id
    // invoice.name = inward.name
    // await invoice.save()
    inward.invoice = invoice._id
    inward.grandTotal = grandTotal
    await inward.save()
    res.redirect('/inward/invoice/'+invoice._id)
}))

function inWords (num) {
    var a = ['','one ','two ','three ','four ', 'five ','six ','seven ','eight ','nine ','ten ','eleven ','twelve ','thirteen ','fourteen ','fifteen ','sixteen ','seventeen ','eighteen ','nineteen '];
    var b = ['', '', 'twenty','thirty','forty','fifty', 'sixty','seventy','eighty','ninety'];
    if ((num = num.toString()).length > 9) return 'overflow';
    n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return; var str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'only ' : '';
    return str;
}

router.route('/:inwardId/:invoiceId/date')
.post(loginRequired('cse'),wrapAsync(async(req,res)=>{
    const {letterDate} = req.body
    const {inwardId,invoiceId} = req.params
    await InwardTest.updateMany({inward:inwardId},{letterDate})
    await Invoice.findByIdAndUpdate(invoiceId,{letterDate})
    const inward = await Inward.findByIdAndUpdate(inwardId,{letterDate,status:'with-department'}).populate('tests')
    for (let test of inward.tests){
        await Department.findByIdAndUpdate(test.dept,{$push:{inwards:test._id}})
    }
    res.redirect('/inward/invoice/'+invoiceId)
}))

router.route('/invoice/:id')
.get(loginRequired(['cse','department','manager','accounts','courier']),wrapAsync(async(req,res)=>{
    res.clearCookie('reportNo')
    const {id} = req.params
    const invoice = await Invoice.findById(id).populate('client')
    const other = await Other.findOne({})
    const {serviceTax} = other
    res.render('cse/inwards/confirm-inward',{invoice,inWords,serviceTax})
}))

router.route('/invoice/:id/upload')
.post(loginRequired('cse'),upload.single('inward-image'),wrapAsync(async(req,res)=>{
    const {id} = req.params
    const invoice = await Invoice.findByIdAndUpdate(id,{image:req.file.key})
    await Inward.findByIdAndUpdate(invoice.inward,{image:req.file.key})
    res.redirect('/inward/invoice/'+id)
}))

router.route('/performa/:id')
.get(loginRequired('cse'),wrapAsync(async(req,res)=>{
    const {id} = req.params
    const invoice = await Invoice.findById(id).populate('client')
    const other = await Other.findOne({})
    const {serviceTax} = other
    res.render('cse/inwards/performa',{invoice,inWords,serviceTax})
}))

router.route('/new/:invoiceId/:testId')
.put(loginRequired('cse'),wrapAsync(async(req,res)=>{
    const {testId,invoiceId} = req.params
    const invoice = await Invoice.findById(invoiceId)
    const dis = invoice.discountPer
    const other = await Other.findOne({})
    const {serviceTax} = other
    let subTotal = 0
    invoice.order.filter(test=>{
        if(test.id == testId){
            const testDis = Number(req.body.price*(serviceTax/100))
            subTotal+=(Number(req.body.price)+testDis)*test.quantity
            return test.rate = req.body.price
        }
        subTotal+=(test.rate+(test.rate*(serviceTax/100)))*test.quantity
        return test
    })
    const discount = Math.floor(subTotal*(dis/100))
    const grandTotal = Math.floor(subTotal-discount + (18/100)*(subTotal-discount))
    invoice.subTotal = subTotal
    invoice.discount = discount
    invoice.grandTotal = grandTotal
    await invoice.save()
    await Inward.findByIdAndUpdate(invoice.inward,{grandTotal})
    res.redirect('/inward/invoice/'+invoiceId)
}))

router.route('/:id/edit-test')
.get(loginRequired('cse'),wrapAsync(async(req,res)=>{
    const {id} = req.params
    const materials = await Material.find({}).populate('physical').populate('chemical').populate('other')
    const inward = await Inward.findById(id).populate('tests')
    res.render('cse/inwards/add-tests',{inward,materials,existing:true})
}))
.put(loginRequired('cse'),wrapAsync(async(req,res)=>{
    const {id} = req.params
    const inward = await Inward.findById(id).populate('tests')
    let reportNo,sampleOfTheDay
    if(!req.cookies.reportNo){
        const totalTests = await InwardTest.count()
        if(totalTests){
            lastRecord = await InwardTest.find({}).skip(totalTests-1)
            reportNo = Number(lastRecord[0].reportNo)
        }else{
            reportNo = 0
        }
        res.cookie('reportNo',reportNo)
        // res.cookie('sampleOfTheDay',reportNo)
    }else{
        reportNo = req.cookies.reportNo
    }
    sampleOfTheDay = reportNo
    const start = new Date('04/01/2022')
    const today = new Date()
    const daysDiff = Math.ceil(Math.abs(today-start)/(1000*60*60*24))
    // reportNo = Number(lastRecord[0].tests[lastRecord[0].tests.length-1].reportNo)
    let allTests = req.body.tests
    if(!Array.isArray(allTests)){
        allTests = [allTests]
    }
    let newAllTests = []
    for( test in allTests){
        newAllTests.push(await Test.findById(allTests[test]))
    }
    let testArr = [...inward.tests]
    for (let i = 0; i < req.body.quantity; i++) {
        sampleOfTheDay++,reportNo++;
        for (const test of newAllTests) {
            const price = test[inward.clientType]
            const sampleNo = `${daysDiff}/${sampleOfTheDay}`
            const newTest = new InwardTest({material:req.body.material,sampleNo,test:test._id,testName:test.name,price,reportNo,dept:test['dept'+req.session.city],inward:inward._id,jobId:inward.jobId,reportDate:inward.reportDate,letterDate:inward.letterDate,status:'pending',payRequired:true,type:inward.type,city:req.session.city})
            await newTest.save()
            testArr.push(newTest)
            inward.tests.push(newTest._id)
            await Department.findByIdAndUpdate(newTest.dept,{$push:{inwards:newTest._id}})
        }
    };
    res.cookie('reportNo',reportNo)

    // EDITING INVOICE
    const other = await Other.findOne({})
    const {serviceTax} = other 
    let order = []
    let subTotal = 0
    testArr.forEach(testi=>{
        const {material,testName,price,test} = testi
        const currTest = order.find(testj => String(testj.testId) == String(test))
        
        const serviceTaxRate = Math.floor(price+((serviceTax/100)*price))
        subTotal+=serviceTaxRate
        if(!currTest){
            const newTest = {material,rate:price,test:testName,testId:test,quantity:1}
            order.push(newTest)
        }
        else{
            order.filter(testi => {
                if(String(testi.testId) == String(currTest.testId)){
                    return testi.quantity+=1
                }
                return testi
            })
        }
    })
    const invoice = await Invoice.findById(inward.invoice)
    const dis = invoice.discountPer
    const discount = Math.floor(subTotal*(dis/100))
    const grandTotal = Math.floor(subTotal-discount + (18/100)*(subTotal-discount))
    invoice.order = order
    invoice.subTotal = subTotal
    invoice.discount = discount
    invoice.grandTotal = grandTotal
    await invoice.save()
    inward.grandTotal = grandTotal
    await inward.save()
    res.redirect(`/inward/${inward._id}/edit-test`)
}))

router.route('/:testId/edit-test')
.delete(loginRequired('cse'),wrapAsync(async(req,res)=>{
    const {testId} = req.params
    const test = await InwardTest.findByIdAndDelete(testId)
    const inward = await Inward.findByIdAndUpdate(test.inward,{$pull:{tests:testId}})
    await Department.findByIdAndUpdate(test.dept,{$pull:{inwards:test._id}})
    //EDITING INVOICE
    const invoice = await Invoice.findById(inward.invoice)
    const other = await Other.findOne({})
    const {serviceTax} = other
    let subTotal = 0
    let newOrder = []
    invoice.order.forEach(testi=>{
        if(!(String(testi.testId)==String(test.test))){
            subTotal+=(testi.rate+(serviceTax/100)*testi.rate)*testi.quantity
            newOrder.push(testi)
        }else if(testi.quantity>1){
            subTotal+=(testi.rate+(serviceTax/100)*testi.rate)*(testi.quantity-1)
            newOrder.push({...testi,quantity:testi.quantity-1})
        }
    })
    const dis = invoice.discountPer
    const discount = Math.floor(subTotal*(dis/100))
    const grandTotal = Math.floor(subTotal-discount + (18/100)*(subTotal-discount))
    invoice.order = newOrder
    invoice.subTotal = subTotal
    invoice.discount = discount
    invoice.grandTotal = grandTotal
    await Inward.findByIdAndUpdate(invoice.inward,{grandTotal})
    await invoice.save()
    res.redirect(`/inward/${inward._id}/edit-test`)
}))

router.route('/pending')
.get(loginRequired(['cse','manager']),wrapAsync(async(req,res)=>{
    const {city} = req.session
    const inwards = await Inward.find({status:'pending',city})
    res.render('cse/inwards/pending',{inwards})
}))

router.route('/all')
.get(loginRequired(['cse','manager']),wrapAsync(async(req,res)=>{
    const {city,userPos} = req.session
    let inwards
    if(userPos=='manager' && city=='VAD'){
        inwards = await Inward.find({})
    }else{
        inwards = await Inward.find({city})
    }
    res.render('cse/inwards/all',{inwards})
}))

router.route('/under-test')
.get(loginRequired('cse'),wrapAsync(async(req,res)=>{
    const {city} = req.session
    const inwards = await Inward.find({city,status:'processing'})
    res.render('cse/inwards/all',{inwards})
}))

router.route('/cse-verified')
.get(loginRequired('cse'),wrapAsync(async(req,res)=>{
    const {city} = req.session
    const inwards = await Inward.find({city,status:'cse-verified'})
    res.render('cse/inwards/all',{inwards})
}))

router.route('/final-verification')
.get(loginRequired('cse'),wrapAsync(async(req,res)=>{
    const {city} = req.session
    const inwards = await Inward.find({city,status:'approved'})
    res.render('cse/inwards/final-ver',{inwards})
}))

router.route('/:id/final-ver')
.get(loginRequired('cse'),wrapAsync(async(req,res)=>{
    const {id} = req.params
    const inward = await Inward.findById(id).populate('invoice').populate('clientId').populate('tests')
    const other = await Other.findOne({})
    const {serviceTax} = other
    res.render('cse/inwards/job-details',{inward,inWords,serviceTax})
}))

router.route('/test/:id/accept')
.post(loginRequired('cse'),wrapAsync(async(req,res)=>{
    const {id} = req.params
    const test = await InwardTest.findByIdAndUpdate(id,{status:'cse-verified'})
    await Department.findByIdAndUpdate(test.dept,{$pull:{inwards:test._id}})
    const inward = await Inward.findById(test.inward).populate("tests")
    let check = 0
    for (let test of inward.tests){
        if(test.status == "cse-verified"){
            check+=1
        }
    }
    if(check == inward.tests.length){
        inward.status = 'cse-verified'
        inward.dispatched = false
        await inward.save()
    }
    res.redirect(`/inward/${test.inward}/final-ver`)
}))

router.route('/test/:id/reject')
.post(loginRequired('cse'),wrapAsync(async(req,res)=>{
    const {id} = req.params
    const test = await InwardTest.findById(id)
    test.status = 'remarked'
    test.remarkedText = 'Rejected By Cse'
    test.previousReport = test.report
    test.report = ''
    await test.save()
    res.redirect(`/inward/${test.inward}/final-ver`)
}))

router.route('/:id')
.get(loginRequired(['cse','manager']),wrapAsync(async(req,res)=>{
    const {id} = req.params
    const inward = await Inward.findById(id).populate('tests')
    res.render('cse/inwards/inward',{inward})
}))

router.route('/')
.get((req,res)=>{
    res.send(req.cookies)
})

module.exports = router