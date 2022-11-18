const express = require('express')
const router = express.Router({mergeParams:true})
const {loginRequired} = require('../../utils/loginMiddleware')
const Department = require('../../models/Department')
const ManagerInfo = require('../../models/ManagerInfo')
const User = require('../../models/User')
const Inward = require('../../models/Inward')
const InwardTest = require('../../models/InwardTest')
const wrapAsync = require('../../utils/wrapAsync')
const transporter = require('../../utils/nodeMailer')

router.route('/all')
.get(loginRequired('manager'),wrapAsync(async(req,res)=>{
    const {city} = req.session
    const manager = await ManagerInfo.findOne({city}).populate('departments')
    const {departments} = manager
    res.render("manager/all-depts.ejs",{departments})
}))

router.route('/new')
.post(loginRequired('manager'),wrapAsync(async(req,res)=>{
    const {city} = req.session
    const manager = await ManagerInfo.findOne({city})
    const department = new Department(req.body)
    await department.save()
    manager.departments = [...manager.departments,department._id]
    await manager.save()
    const user = new User(req.body)
    user.position = 'department'
    user.deptId = department._id
    user.save()
    req.flash('success',"Department Added Successfully")
    res.redirect('/department/all')

    const mailOptions = {
        from: process.env.MAIL_ADDRESS,
        to: req.session.mainEmail,
        subject: "Department Added Successfully",
        html:`
        Follwing Department has been added to manager ${req.session.city}:<br><br>
        Name: ${department.name}<br><br>
        Email: ${department.email}<br><br>
        `
    };
    transporter.sendMail(mailOptions);
}))

router.route('/:id/all')
.get(loginRequired(['manager','department']),wrapAsync(async(req,res)=>{
    const {id} = req.params
    const department = await Department.findById(id).populate('inwards')
    const tests = department.inwards
    res.render('manager/tests',{tests})
}))
.put(loginRequired('manager'),wrapAsync(async(req,res)=>{
    const {id} = req.params
    let department
    try{
        if(!req.body.password){
            const oldDepartment = await Department.findById(id)
            req.body.password = oldDepartment.password
        }
        department = await Department.findByIdAndUpdate(id,req.body)
        req.flash("success","Department added successfully")
        res.redirect('/department/all')
    }catch(e){
        req.flash('error',"No such department")
        return res.redirect('/department/all')
    }

    const mailOptions = {
        from: process.env.MAIL_ADDRESS,
        to: req.session.mainEmail,
        subject: "Department Edited Successfully",
        html:`
        Follwing Department has been edited under manager ${req.session.city}:<br><br>
        Name: ${department.name}<br><br>
        Email: ${department.email}<br><br>
        `
    };
    transporter.sendMail(mailOptions);
}))
.delete(loginRequired('manager'),wrapAsync(async(req,res)=>{
    const {id} = req.params
    let department;
    try{
        department = await Department.findByIdAndDelete(id)
        await ManagerInfo.findOneAndUpdate({city:department.city},{$pull:{departments:department._id}})
        req.flash('success',"Department deleted successfully")
        res.redirect('/department/all')
    }catch(e){
        req.flash('error',"No such department found")
        return res.redirect('/department/all')
    }
}))

router.route('/inward/all')
.get(loginRequired('manager'),wrapAsync(async(req,res)=>{
    const {city} = req.session
    const inwards = await Inward.find({city})
    res.render('manager/all-inwards',{inwards})
}))

function inWords (num) {
    var a = ['','one ','two ','three ','four ', 'five ','six ','seven ','eight ','nine ','ten ','eleven ','twelve ','thirteen ','fourteen ','fifteen ','sixteen ','seventeen ','eighteen ','nineteen '];
    var b = ['', '', 'twenty','thirty','forty','fifty', 'sixty','seventy','eighty','ninety'];
    if ((num = num.toString()).length > 9) return 'overflow';
    n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return; var str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'only ' : '';
    return str;
}

// FOR DEPARTMENT ACCESS ONLY, NOT MANAGER

router.route('/pending')
.get(loginRequired('department'),wrapAsync(async(req,res)=>{
    const {deptId} = req.session
    const department = await Department.findById(deptId).populate('inwards')
    const tests = department.inwards.filter((test)=>{
        return test.status == 'pending'
    })
    res.render('department/pending',{tests})
}))

router.route('/processing')
.get(loginRequired('department'),wrapAsync(async(req,res)=>{
    const {deptId} = req.session
    const department = await Department.findById(deptId).populate('inwards')
    const tests = department.inwards.filter((test)=>{
        return test.status == 'processing'
    })
    res.render('department/processing',{tests})
}))

router.route('/remarked')
.get(loginRequired('department'),wrapAsync(async(req,res)=>{
    const {deptId} = req.session
    const department = await Department.findById(deptId).populate('inwards')
    const tests = department.inwards.filter((test)=>{
        return test.status == 'remarked'
    })
    res.render('department/remarked',{tests})
}))

router.route('/approved')
.get(loginRequired('department'),wrapAsync(async(req,res)=>{
    const {deptId} = req.session
    const department = await Department.findById(deptId).populate('inwards')
    const tests = department.inwards.filter((test)=>{
        return test.status == 'approved'
    })
    res.render('department/approved',{tests})
}))

router.route('/inward/:id')
.get(loginRequired(['department','manager']),wrapAsync(async(req,res)=>{
    const {id} = req.params
    const inward = await Inward.findById(id).populate('invoice').populate('clientId').populate('tests')
    res.render('manager/inward.ejs',{inward,inWords})
}))

router.route('/test/:id/status/processing')
.post(loginRequired('department'),wrapAsync(async(req,res)=>{
    const {id} = req.params
    const today = new Date()
    const processDate = `${today.getMonth()+1}/${today.getDate()}/${today.getFullYear()}`
    const test = await InwardTest.findByIdAndUpdate(id,{status:'processing',processDate})
    req.flash('success',"Status changed to processing")
    res.redirect('back')
}))

router.route('/test/:id/upload')
.get(loginRequired('department'),wrapAsync(async(req,res)=>{
    const {id} = req.params
    const test = await InwardTest.findById(id)
    res.render('department/upload-file',{test})
}))

module.exports = router