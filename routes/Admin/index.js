const express = require('express')
const router = express.Router({mergeParams:true})
const {loginRequired} = require('../../utils/loginMiddleware')
const User = require('../../models/User')
const transporter = require('../../utils/nodeMailer')
const wrapAsync = require('../../utils/wrapAsync')

router.route('/')
.get(loginRequired('admin'),wrapAsync(async(req,res)=>{
    const users = await User.find({})
    res.render('admin/admin.ejs',{users})
}))

router.route('/user/:id')
.put(loginRequired('admin'),wrapAsync(async(req,res)=>{
    const {id} = req.params
    const {email,password} = req.body
    const unique = await User.findOne({email})
    const user = await User.findById(id)
    const previousMail = user.email
    if(unique){
        if(password && unique.email == user.email){
            unique.password = password
            await unique.save()
            req.flash('success',"Password changed")
            res.redirect('/admin')
        }else{
            req.flash('error',"Email already in use")
            return res.redirect('/admin')
        }
    }else{
        user.email = email
        if(req.body.password){
            user.password = password
            req.flash('success','Email and password changed Successfully')
        }else{
            req.flash('success','Email Changed Successfully')
        }
        await user.save()
        res.redirect('/admin')
    }
    const admin = await User.findOne({position:"admin"})
    const mailOptions = {
        from: process.env.MAIL_ADDRESS,
        to: admin.email,
        subject: "Changes in user details",
        html:`Details of following user were changed: <br><br>
        Name: ${user.name}<br><br>
        Previous Email: ${unique ? user.email : previousMail}<br><br>
        Current Email: ${user.email}<br><br>
        Position: ${user.position}<br><br>
        ${password ? `Password: ${password}<br><br>` : `Password was not changed`}
        `
    };   
    transporter.sendMail(mailOptions); 
}))

module.exports = router