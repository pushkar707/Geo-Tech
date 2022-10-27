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
const nodemailer = require('nodemailer');
const methodOverride = require('method-override')
const flash = require('connect-flash');
const ejsMate = require('ejs-mate')

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

const loginRequired = (req,res,next)=>{
    if(!req.session.user_id){
        return res.redirect('/login')
    }
    next()
}

const adminLoginRequired = (req,res,next) => {
    if(!req.session.admin){
        return res.redirect('/admin-login')
    }
    next();
}

app.set('view engine', 'ejs');
app.engine('ejs',ejsMate)

app.set('views',path.join(__dirname,'views'))
app.use(express.static(path.join(__dirname, 'public')))

app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: process.env.SECRET,resave:false,saveUninitialized:true }))

app.use(methodOverride('_method'))
app.use(flash());

app.use((req,res,next)=>{
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

app.get('/',(req,res)=>{
    res.redirect('/login/admin')
})

app.get('/login/:user',(req,res)=>{
    res.render('login.ejs',{user:req.params.user})
})

app.post('/login/:user',async(req,res)=>{
    const {email,password} = req.body
    try{
        const user = User.findAndValidate(email,password)
        if(user){
            req.session.user_id = user._id
            if(req.params.user === "admin"){
                req.session.admin = true
                res.redirect("/admin")
            }
        }else{
            req.flash("error","Invalid login details")
            res.redirect("/login/admin")
        }
    }
    catch(e){
        console.log(e);
        res.redirect('/login/admin')
    }
})

// app.get('/register',(req,res)=>{
//     res.render('register.ejs')
// })

// app.post('/register',async(req,res)=>{
//     const {email,password,name,position,city} = req.body
//     const unique = await User.findOne({email})
//     if(unique){
//         res.send("Email already in use")
//     }else{
//         const user = new User({email,password,position,city,name})
//         await user.save()
//         req.session.user_id = user._id;
//         // res.redirect(`/welcome/${user._id}`);
//         res.redirect('/register')
//     }
// })

// app.get('/login',(req,res)=>{
//     res.render('login.ejs')
// })


// app.post('/login',async(req,res)=>{
//     const {email,password} = req.body
//     const foundUser = await User.findAndValidate(email,password)
//     console.log(foundUser);
//     if (foundUser){
//         req.session.user_id = foundUser._id;
//         res.redirect(`/welcome/${foundUser._id}`);
//     }
//     else {
//         res.redirect('/login')
//     }
// })

// app.get('/welcome/:id',loginRequired,async(req,res)=>{
//     const {id} = req.params
//     const user = await User.findById(id)
//     if(user){
//         res.render('user.ejs',{user})
//     }else{
//         res.send("Not found")
//     }
// })

// app.get('/manager',(req,res)=>{
//     res.render('manager_login.ejs')
// })

// app.get('/cse',(req,res)=>{
//     res.render('cse_login.ejs')
// })

// app.get('/main-manager',(req,res)=>{
//     res.render('main_manager.ejs')
// })

// app.get('/main-account',(req,res)=>{
//     res.render('main_manager.ejs')
// })

// app.get('/main-courier',(req,res)=>{
//     res.render('main_manager.ejs')
// })


app.get("/forgot",(req,res)=>{
    res.render('forgot.ejs')
})

app.post('/forgot',async(req,res)=>{
    const {email} = req.body
    const user = await User.findOne({email})
    if(!user){
        res.send("No account registered on that mail")
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
              console.log(error);
              res.send(error)
            } else {
              res.send("Mail sent!")
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
        return res.send("Passwords don't match")
    }else{
        const user = await User.findById(id)
        user.password = newPass
        await user.save()
        res.send("Password Changed")
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

app.listen(process.env.PORT,()=>{
    console.log("Connected to port "+process.env.PORT);
})