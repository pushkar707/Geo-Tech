const express = require('express')
const router = express.Router({mergeParams:true})
const User = require('../../models/User')
const wrapAsync = require('../../utils/wrapAsync')

router.route('/:city?')
.get((req,res)=>{
    res.render('login.ejs',{user:req.params.user,city:req.params.city})
})
.post(wrapAsync(async(req,res)=>{
    const {email,password} = req.body
    const {user} = req.params
    try{
        const validUser = await User.findAndValidate(email,password,user)
        const loginUser = await User.findOne({email})
        if(validUser){
            req.session.userId = loginUser._id
            req.session.userEmail = loginUser.email
            req.session.userPos = user
            if(user === "admin"){
                res.redirect("/admin")
            }
            else if(user === "cse"){
                res.redirect('/material/all')
            }
            else if(user === "manager"){
                res.send("done")
            }
            else if(user === "courier"){
                res.send("done")
            }
            else if(user === "accounts"){
                res.send("done")
            }
        }else{
            req.flash("error","Invalid login details")
            res.redirect("/login/"+user)
        }
    }
    catch(e){
        console.log(e);
        res.redirect("/login/"+user)
    }
}))

module.exports = router