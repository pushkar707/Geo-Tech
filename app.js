if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const session = require('express-session');
// MODELS
const User = require('./models/User')
const Material = require('./models/Material')
const Test = require('./models/Test')
//ROUTES
const users = require('./routes/CSE/material')
const tests = require('./routes/CSE/test')
const logins = require('./routes/Login/login')
const forgot = require('./routes/Login/forgot')
const changePass = require('./routes/Login/changePass')
//
const {loginRequired} = require('./loginMiddleware')
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

app.use((req,res,next)=>{
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

app.get('/',(req,res)=>{
    res.render('add-client')
    // res.redirect('/login/admin')
})

//LOGIN
app.use('/login/:user',logins)
app.use('/forgot',forgot)
app.use('/changePass',changePass)
// CSE
app.use('/material',users)
app.use('/test',tests)



// ADMIN ROUTES

app.get('/admin',loginRequired('admin'),async(req,res)=>{
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