const express = require('express')
const router = express.Router({mergeParams:true})
const {loginRequired} = require('../../utils/loginMiddleware')
const Order = require('../../models/Order')
const Department = require('../../models/Department')
const ManagerInfo = require('../../models/ManagerInfo')
const wrapAsync = require('../../utils/wrapAsync')
const transporter = require('../../utils/nodeMailer')

router.route('/all')
.get(loginRequired('manager'),wrapAsync(async(req,res)=>{
    const {city} = req.session
    const manager = await ManagerInfo.findOne({city}).populate('departments')
    res.send(manager.departments)
}))

router.route('/add')
.get(loginRequired('manager'),(req,res)=>{
    res.render('test')
})
.post(loginRequired('manager'),wrapAsync(async(req,res)=>{
    const {city} = req.session
    const manager = await ManagerInfo.findOne({city})
    const department = new Department(req.body)
    department.manager = manager._id
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
    const department = await Department.findById(id)
    if(!department){
        req.flash('error',"No such department found")
        return res.redirect('/department/all')
    }
    res.send(department)
}))
.put(loginRequired('manager'),wrapAsync(async(req,res)=>{
    // ROUTE TO EDIT DEPARTMENT // PENDING DEPENDING ON FRONTEND
    const {id} = req.params
    const department = await Department.findById(id)
    if(!department){
        req.flash('error',"No such department found")
        return res.redirect('/department/all')
    }
    req.flash("success","Department added successfully")
    res.redirect('/department/'+id)

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

router.route('/:deptId/order/:orderId')
.post(loginRequired('manager'),wrapAsync(async(req,res)=>{
    const {deptId,orderId} = req.params
    const department = await Department.findById(deptId)
    if(!department){
        req.flash('error',"No such department found")
        return res.redirect('/department/all')
    }
    const order = await Order.findById(orderId).populate('test').populate('client')
    if(!order){
        req.flash('error',"No such Order found")
        return res.redirect('/department/'+deptId)
    }
    order.department = deptId
    await order.save()
    department.orders = [...department.orders,orderId]
    await department.save()
    req.flash('success',"Test added successfully")
    res.redirect('/department/'+deptId)

    const mailOptions = {
        from: process.env.MAIL_ADDRESS,
        to: req.session.mainEmail,
        subject: "Order Added Successfully",
        html:`
        Follwing Order has been added to department ${department.name} under manager ${req.session.city}:<br><br>
        Test Name: ${order.test.name}<br><br>
        Client Name: ${order.client.name}<br><br>
        `
    };
    transporter.sendMail(mailOptions);
}))

module.exports = router