const express = require('express')
const router = express.Router({mergeParams:true})
const User = require('../../models/User')
const wrapAsync = require('../../wrapAsync')

router.route('/:id')
.get(wrapAsync(async(req,res)=>{
    const {id} = req.params
    const user = await User.findById(id)
    if(!user){
        return res.send("No such user exists")
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
        user.password = newPass
        await user.save()
        req.flash('success',"Password Changed")
        res.redirect('/changepass/'+id)
    }
}))

module.exports = router