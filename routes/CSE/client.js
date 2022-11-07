const express = require('express')
const router = express.Router({mergeParams:true})
const {loginRequired} = require('../../utils/loginMiddleware')
const Client = require('../../models/Client')
const Test = require('../../models/Test')
const Order = require('../../models/Order')
const CseInfo = require('../../models/CseInfo')
const ManagerInfo = require('../../models/ManagerInfo')
const wrapAsync = require('../../utils/wrapAsync')
const transporter = require('../../utils/nodeMailer')

router.route('/all')
.get(loginRequired('cse'),wrapAsync(async(req,res)=>{
    const {city} = req.session
    const cse = await CseInfo.findOne({city}).populate('clients')
    const clients = cse.clients
    res.render('cse/client/all-clients',{clients})
}))

router.route('/new')
.get(loginRequired('cse'),wrapAsync(async(req,res)=>{
    if(await Client.count() > 0){
        lastRecord = await Client.find({}).skip(await Client.count() - 1)
        lastCode = lastRecord[0].clientCode
    }
    else{
        lastCode = 0
    }
    res.render('cse/client/add-client',{lastCode})
}))
.post(loginRequired('cse'),wrapAsync(async(req,res)=>{
    const {city} = req.session
    const client = new Client(req.body)
    client.cse = city
    await client.save()
    await CseInfo.findOneAndUpdate({city},{$push:{clients:client._id}})
    req.flash('success',"Client added successfully")
    res.redirect('/client/all')

    const mailOptions = {
        from: process.env.MAIL_ADDRESS,
        to: req.session.mainEmail,
        subject: "Created New Client",
        html:`
        Client with following details has been created by CSE ${req.session.city}:<br><br>
        ${req.body}
        `
    };
    transporter.sendMail(mailOptions);
}))

router.route('/:id')
.get(loginRequired('cse'),wrapAsync(async(req,res)=>{
    const {id} = req.params
    try{
        const client = await Client.findById(id)
        res.render('cse/client/edit-client',{client})
    }catch(e){
        req.flash('error',"Client Not Found")
        res.redirect('/client/all')
    }
}))
.put(loginRequired('cse'),wrapAsync(async(req,res)=>{
    const {id} = req.params
    try{
        if(!req.body.password){
            const oldClient = await Client.findById(id)
            req.body.password = oldClient.password
        }
        const client = await Client.findByIdAndUpdate(id,req.body)
        req.flash('success',"Client Edited Successfully")
        res.redirect('/client/all')
    }catch(e){
        req.flash('error',"Client Not Found")
        res.redirect('/client/all')
    }
}))
.delete(loginRequired('cse'),wrapAsync(async(req,res)=>{
    const {id} = req.params
    try{
        const client = await Client.findByIdAndDelete(id)
        await CseInfo.findOneAndUpdate({city:client.cse},{$pull:{clients:client._id}})
        req.flash('success',"Client Deleted Successfully")
        res.redirect('/client/all')

        const mailOptions = {
            from: process.env.MAIL_ADDRESS,
            to: req.session.mainEmail,
            subject: "Deleted Client",
            html:`
            Client with following details has been deleted by CSE ${req.session.city}:<br><br>
            ${client}
            `
        };
        transporter.sendMail(mailOptions);
    }catch(e){
        req.flash('error',"Client Not Found")
        res.redirect('/client/all')
    }
}))

router.route('/:clientId/order/:testId')
.post(loginRequired('cse'),wrapAsync(async(req,res)=>{
    const {clientId,testId} = req.params
    const {city} = req.session
    const client = await Client.findById(clientId)
    if(!client){
        req.flash('error',"Client Not Found")
        return res.redirect('/client/all')
    }
    if(client.cse!=city){
        req.flash("error","You are not allowed to do that")
        return res.redirect('/client/all')
    }
    const test = await Test.findById(testId)
    if(!test){
        req.flash("error","No Such Test Found")
        return res.redirect('client'+clientId)
    }
    const order = new Order({city,test:testId,client:clientId})
    await order.save()
    client.orders = [...client.orders,order._id]
    await client.save()
    await ManagerInfo.findOneAndUpdate({city},{$push:{orders:order._id}})
    req.flash("success","Order Added Successfully")
    // res.redirect('/client'+clientId)
    res.send(order)

    const mailOptions = {
        from: process.env.MAIL_ADDRESS,
        to: req.session.mainEmail,
        subject: "Added Order to Client",
        html:`
        Test ${test.name} has been added to client ${client.name}
        `
    };
    transporter.sendMail(mailOptions);
}))

module.exports = router