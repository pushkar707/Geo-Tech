const express = require('express')
const router = express.Router({mergeParams:true})
const User = require('../../models/User')

router.route('/:city?')
.get((req,res)=>{
    res.render('login.ejs',{user:req.params.user,city:req.params.city})
})
.post(async(req,res)=>{
    const {email,password} = req.body
    const {user} = req.params
    try{
        const validUser = await User.findAndValidate(email,password,user)
        if(validUser){
            req.session.user_id = user._id
            if(user === "admin"){
                req.session.admin = true
                res.redirect("/admin")
            }
            else if(user === "cse"){
                req.session.cse = true
                res.redirect('/material/all')
            }
            else if(user === "manager"){
                req.session.manager = true
                res.send("done")
            }
            else if(user === "courier"){
                req.session.courier = true
                res.send("done")
            }
            else if(user === "accounts"){
                req.session.accounts = true
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
})

module.exports = router