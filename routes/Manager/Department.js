const express = require('express')
const router = express.Router({mergeParams:true})
const {loginRequired} = require('../../utils/loginMiddleware')
const Department = require('../../models/Department')
const ManagerInfo = require('../../models/ManagerInfo')
const Inward = require('../../models/Inward')
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

router.route('/:id')
.get(loginRequired('manager'),wrapAsync(async(req,res)=>{
    const {id} = req.params
    const {city} = req.session
    const department = await Department.findById(id)
    const inwards = await Inward.find({city,tests:{$elemMatch:{test:{$in:department.tests}}}})
    const tests = []
    for(let inward of inwards){
        inward.tests.filter((test)=>{
            if(department.tests.includes(test.test)){
                tests.push(test)
            }
        })
    }
    res.render('manager/inwards',{tests})
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


module.exports = router