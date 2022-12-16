if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const session = require('express-session');
const cookieParser = require('cookie-parser')
// MODELS
const Inward = require('./models/Inward')
const InwardTest = require('./models/InwardTest')
const Test = require('./models/Test')
//ROUTES
const userRoutes = require('./routes/CSE/material')
const testRoutes = require('./routes/CSE/test')
const clientRoutes = require('./routes/CSE/client')
const inwardRoutes = require('./routes/CSE/inwards')
const departmentRoutes = require('./routes/Manager/Department')
const managerTestRoutes = require('./routes/Manager/test')
const loginRoutes = require('./routes/Login/login')
const forgotRoutes = require('./routes/Login/forgot')
const changePassRoutes = require('./routes/Login/changePass')
const adminRoutes = require('./routes/Admin')
const managerRoutes = require('./routes/Manager/manager')
//
const methodOverride = require('method-override')
const flash = require('connect-flash');
const ejsMate = require('ejs-mate')
const bodyParser = require('body-parser')
const AppError = require('./utils/AppError')

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
app.use(cookieParser())

app.use(methodOverride('_method'))
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(flash());

app.use(async(req,res,next)=>{
    res.locals.currentUser = req.session.userId
    res.locals.currentUserCity = req.session.city
    res.locals.currentUserPos = req.session.userPos
    if(req.session.userPos == 'cse'){
        req.session.inwardTables = new Set()
        const inwards = await Inward.find({})
        for (let inward of inwards){
            req.session.inwardTables.add(inward.status)
        }
        res.locals.inwardTables = req.session.inwardTables
    }else if(req.session.userPos == 'manager'){
        req.session.managerTables = new Set()
        const tests = await InwardTest.find({})
        for (let test of tests){
            req.session.managerTables.add(test.status)
        }
        res.locals.managerTables = req.session.managerTables
    }else if(req.session.userPos == 'department'){
        res.locals.currentDeptId = req.session.deptId
        res.locals.currentDeptName = req.session.deptName
        req.session.departmentTables = new Set()
        const tests = await InwardTest.find({dept:req.session.deptId})
        for(let test of tests){
            req.session.departmentTables.add(test.status)
        }
        res.locals.departmentTables = req.session.departmentTables
    }
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

app.get('/',(req,res)=>{
    res.redirect('/login/admin')
})

//LOGIN
app.use('/login/:user',loginRoutes)
app.use('/forgot',forgotRoutes)
app.use('/changePass',changePassRoutes)
// CSE
app.use('/material',userRoutes)
app.use('/test',testRoutes)
app.use('/client',clientRoutes)
app.use('/inward',inwardRoutes)
// Manager
app.use('/department',departmentRoutes)
app.use('/manager',managerRoutes)
//admin
app.use('/admin',adminRoutes)
app.use('/test',managerTestRoutes)

app.get('/test',(req,res)=>{res.render('test')})

// app.all('*',(req,res)=>{
//    throw new AppError('Page Not found',404)
// })

app.use((err, req, res, next) => {
    const { status = 500} = err;
    if(!err.message){err.message ="Something went wrong"}
    console.log(err);
    res.send(err);
})

app.listen(process.env.PORT,()=>{
    console.log("Connected to port "+process.env.PORT);
})
