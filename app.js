if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const session = require('express-session');
const User = require('./models/User')
const Material = require('./models/Material')
const Test = require('./models/Test')
const nodemailer = require('nodemailer');
const methodOverride = require('method-override')
const flash = require('connect-flash');
const ejsMate = require('ejs-mate')
const bodyParser = require('body-parser')

mongoose.connect(process.env.MONGODB_URI,{
    useUnifiedTopology: true,
    useNewUrlParser: true,
    autoIndex: true,
})
.then(()=>{
    console.log("Connected to mongoose");
}).catch((e)=>{
    console.log("Could not connect to mongoose");
    console.log(e);
})


app.set('view engine', 'ejs');
app.engine('ejs',ejsMate)

app.set('views',path.join(__dirname,'views'))
app.use(express.static(path.join(__dirname, 'public')))

app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: process.env.SECRET,resave:false,saveUninitialized:true }))

app.use(methodOverride('_method'))
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(flash());

const loginRequired = (req,res,next)=>{
    if(!req.session.user_id){
        return res.redirect('/login')
    }
    next()
}

const adminLoginRequired = (req,res,next) => {
    if(!req.session.admin){
        return res.redirect('/login/admin')
    }
    next();
}

const cseLoginRequired = (req,res,next) => {
    // if(!req.session.cse){
    //     return res.redirect('/login/cse')
    // }
    next();
}

const managerLoginRequired = (req,res,next) => {
    if(!req.session.manager){
        return res.redirect('/login/cse')
    }
    next();
}

const accountsLoginRequired = (req,res,next) => {
    if(!req.session.accounts){
        return res.redirect('/login/cse')
    }
    next();
}

const courierLoginRequired = (req,res,next) => {
    if(!req.session.courier){
        return res.redirect('/login/cse')
    }
    next();
}


app.use((req,res,next)=>{
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

app.get('/',(req,res)=>{
    res.redirect('/login/admin')
})

app.get('/login/:user/:city?',(req,res)=>{
    res.render('login.ejs',{user:req.params.user,city:req.params.city})
})

app.post('/login/:user',async(req,res)=>{
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
                res.session.cse = true
                res.send("done")
            }
            else if(user === "manager"){
                res.session.manager = true
                res.send("done")
            }
            else if(user === "courier"){
                res.session.courier = true
                res.send("done")
            }
            else if(user === "accounts"){
                res.session.accounts = true
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

app.get('/admin',adminLoginRequired,async(req,res)=>{
    const users = await User.find({})
    res.render('admin.ejs',{users})
})

app.put('/user/:id',async(req,res)=>{
    const {id} = req.params
    const {email,password} = req.body
    const unique = await User.findOne({email})
    if(unique){
        req.flash('error',"Email already in use")
        res.redirect('/admin')
    }else{
        const user = await User.findById(id)
        user.email = email
        user.password = password
        await user.save()
        req.flash('success','Email Changed Successfully')
        res.redirect('/admin')
    }
})

app.get('/materials',cseLoginRequired,async(req,res)=>{
    const materials = await Material.find({})
    res.render("all-tests.ejs",{materials})
})

app.post('/material/new',cseLoginRequired, async(req,res)=>{
    const {name} = req.body
    const material = new Material({name})
    await material.save()
    res.send(material)
})

app.get('/material/:id',cseLoginRequired, async(req,res)=>{
    const {id} = req.params
    const material = await Material.findById(id).populate('physical').populate('chemical').populate('other')
    const categories = ["physical","chemical","other"]
    res.render('add-tests',{material,categories})
})

app.put('/material/add/:type/:id',cseLoginRequired,async(req,res)=>{
    console.log("hello");
    const {id,type} = req.params
    const test = new Test(req.body)
    test.material = id
    await test.save()
    let newMaterial
    if(type == "physical"){
        newMaterial = await Material.findByIdAndUpdate(id,{$push:{physical:test._id}})
    }else if(type == "chemical"){
        newMaterial = await Material.findByIdAndUpdate(id,{$push:{chemical:test._id}})
    }else if(type == "other"){
        newMaterial = await Material.findByIdAndUpdate(id,{$push:{other:test._id}})
    }
    // res.send("done")
    req.flash("success",'Test added')
    await res.redirect('/material/'+id)
})

app.delete('/material/:id',cseLoginRequired,async(req,res)=>{
    const {id} = req.params
    const deleteMaterial = await Material.findByIdAndDelete(id)
    req.flash('success',`${deleteMaterial.name} deleted successfully`)
    res.redirect('/materials')
})

// FOR TESTS

// app.put('/test/:id',cseLoginRequired,async(req,res)=>{
//     const {id} = req.params
//     const {name} = req.body
//     await Test.findByIdAndUpdate(id,{name})
// })

app.delete('/test/:id',cseLoginRequired,async(req,res)=>{
    const {id} = req.params
    const test = await Test.findByIdAndDelete(id)
    await Material.findByIdAndUpdate(test.material,{$pull:{physical:id}})
    req.flash("success","Test deleted successfully")
    res.redirect('/material/'+test.material) 
})

app.get("/forgot",(req,res)=>{
    res.render('forgot.ejs')
})

app.post('/forgot',async(req,res)=>{
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
})

app.get('/changePass/:id',async(req,res)=>{
    const {id} = req.params
    const user = await User.findById(id)
    if(!user){
        return res.send("No such user exists")
    }
    res.render('change_pass.ejs',{user})
})

app.post('/changePass/:id',async(req,res)=>{
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
})

app.listen(process.env.PORT,()=>{
    console.log("Connected to port "+process.env.PORT);
})