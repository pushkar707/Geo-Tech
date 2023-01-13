const express = require('express')
const router = express.Router({mergeParams:true})
const {loginRequired} = require('../../utils/loginMiddleware')
const Client = require('../../models/Client')
const User = require('../../models/User')
const CseInfo = require('../../models/CseInfo')
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
    const {name,email,password} = req.body
    const user = new User({name,email,password,city,position:'client',clientId:client._id})
    await user.save()

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


module.exports = router