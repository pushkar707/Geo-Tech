const express = require('express')
const router = express.Router({mergeParams:true})
const {loginRequired} = require('../../utils/loginMiddleware')
const Client = require('../../models/Client')
const wrapAsync = require('../../utils/wrapAsync')
const transporter = require('../../utils/nodeMailer')

router.route('/all')
.get(loginRequired('cse'),wrapAsync(async(req,res)=>{
    const clients = await Client.find({})
    res.render('all-clients',{clients})
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
    res.render('add-client',{lastCode})
}))
.post(loginRequired('cse'),wrapAsync(async(req,res)=>{
    const client = new Client(req.body)
    await client.save()
    req.flash('success',"Client added successfully")
    res.redirect('/client/all')

    const mailOptions = {
        from: process.env.MAIL_ADDRESS,
        to: req.session.userEmail,
        subject: "Created New Client",
        html:`
        Client with following details has been created:<br><br>
        ${req.body}
        `
    };
    transporter.sendMail(mailOptions);
}))

router.route('/:id')
.delete(loginRequired('cse'),wrapAsync(async(req,res)=>{
    const {id} = req.params
    try{
        const client = await Client.findByIdAndDelete(id)
        req.flash('success',"Client Deleted Successfully")
        res.redirect('/client/all')

        const mailOptions = {
            from: process.env.MAIL_ADDRESS,
            to: req.session.userEmail,
            subject: "Deleted Client",
            html:`
            Client with following details has been deleted:<br><br>
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