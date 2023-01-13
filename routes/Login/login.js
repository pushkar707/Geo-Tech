const express = require('express')
const router = express.Router({mergeParams:true})
const User = require('../../models/User')
const wrapAsync = require('../../utils/wrapAsync')

router.route('/:city?')
.get((req,res)=>{
    res.render('login/login.ejs',{user:req.params.user,city:req.params.city})
})
.post(wrapAsync(async(req,res)=>{
    const {email,password} = req.body
    const {user} = req.params
    try{
        const validUser = await User.findAndValidate(email,password,user)
        if(validUser){
            req.session.userId = validUser._id
            req.session.userPos = user
            if(user === "admin"){
                res.redirect("/admin")
            }
            else if(user === "cse"){
                const mainUser = await User.findOne({city:"VAD",position:user})
                req.session.mainEmail = mainUser.email
                req.session.city = validUser.city
                res.redirect('/material/all')
            }
            else if(user === "manager"){
                const mainUser = await User.findOne({city:"VAD",position:user})
                req.session.mainEmail = mainUser.email
                req.session.city = validUser.city
                res.redirect('/department/all')
            }
            else if(user == "department"){
                req.session.city = validUser.city
                req.session.deptId = validUser.deptId
                req.session.deptName = validUser.name
                res.redirect('/department/'+validUser.deptId+'/all')
            }
            else if(user === "courier"){
                res.redirect('/courier/pending')
            }
            else if(user === "accounts"){
                res.redirect('/accounts/pending')
            }
            else if(user == 'client'){
                req.session.clientId = validUser.clientId
                res.redirect('/client/user/all')
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