const express = require('express')
const router = express.Router({mergeParams:true})
const {loginRequired} = require('../../utils/loginMiddleware')
const User = require('../../models/User')
const wrapAsync = require('../../utils/wrapAsync')

router.route('/')
.get(loginRequired('admin'),wrapAsync(async(req,res)=>{
    const users = await User.find({})
    res.render('admin.ejs',{users})
}))

router.route('/user/:id')
.put(loginRequired('admin'),wrapAsync(async(req,res)=>{
    const {id} = req.params
    const {email,password} = req.body
    const unique = await User.findOne({email})
    const user = await User.findById(id)
    if(unique){
        if(password && unique.email == user.email){
            unique.password = password
            await unique.save()
            req.flash('success',"Password changed")
            res.redirect('/admin')
        }else{
            req.flash('error',"Email already in use")
            res.redirect('/admin')
        }
    }else{        
        user.email = email
        if(req.body.password){
            user.password = password
        }
        await user.save()

        req.flash('success','Email Changed Successfully')
        res.redirect('/admin')
    }
}))

// .put(loginRequired('admin'),wrapAsync(async(req,res)=>{
//     const {id} = req.params
//     const {email} = req.body
//     const unique = await User.findOne({email})
//     if(unique){
//         req.flash('error',"Email already in use")
//         res.redirect('/admin')
//     }else{
//         const user = await User.findById(id)
//         user.email = email
//         if(req.body.password){
//             user.password = password
//         }
//         await user.save()

//         req.flash('success','Email Changed Successfully')
//         res.redirect('/admin')
//     }
// }))

module.exports = router