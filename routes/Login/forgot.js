const express = require('express')
const router = express.Router({mergeParams:true})
const User = require('../../models/User')
const nodemailer = require('nodemailer');
const wrapAsync = require('../../wrapAsync')

router.route('/')
.get((req,res)=>{
    res.render('forgot.ejs')
})
.post(wrapAsync(async(req,res)=>{
    const {email} = req.body
    const user = await User.findOne({email})
    if(!user){
        req.flash('error',"No account registered on that mail")
        res.redirect('/forgot')
    }else{
        const {_id} = user

        nodemailer.createTransport({ sendmail: true })

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.MAIL_ADDRESS,
              pass: process.env.MAIL_PASS
            }
        });
        
        const mailOptions = {
            from: process.env.MAIL_ADDRESS,
            to: user.email,
            subject: "Password reset link",
            html:`Click <a href="http://localhost:3000/changePass/${_id}">here</a> link below to change your password: <br><br>`
        };   

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                req.flash('error',error)
                res.redirect('/forgot')
            } else {
                req.flash('success',"Mail Sent")
                res.redirect('/forgot')
            }
        });  
    }
}))

module.exports = router