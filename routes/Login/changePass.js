const express = require('express')
const router = express.Router({mergeParams:true})
const User = require('../../models/User')
const AppError = require('../../utils/AppError')
const wrapAsync = require('../../utils/wrapAsync')

router.route('/:id')
.get(wrapAsync(async(req,res)=>{
    const {id} = req.params
    const user = await User.findById(id)
    if(!user){
        throw new AppError("No such user exists",404)
    }
    res.render('change_pass.ejs',{user})
}))
.post(wrapAsync(async(req,res)=>{
    const {id} = req.params
    const {newPass,confirmPass} = req.body
    if(newPass!=confirmPass){
        req.flash('error',"Passwords don't match")
        res.redirect('/changepass/'+id)
    }else{
        const user = await User.findById(id)
        if(!user){            
            throw new AppError("No such user exists",404)
        }
        user.password = newPass
        await user.save()
        req.flash('success',"Password Changed")
        res.redirect('/changepass/'+id)
    }
}))

module.exports = router