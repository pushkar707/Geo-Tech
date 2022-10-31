const express = require('express')
const router = express.Router({mergeParams:true})
const {loginRequired} = require('../../utils/loginMiddleware')
const Client = require('../../models/Client')
const wrapAsync = require('../../utils/wrapAsync')

router.route('/all')
.get(loginRequired('cse'),wrapAsync(async(req,res)=>{
    const clients = await Client.find({})
    res.render('all-clients',{clients})
}))

router.route('/new')
.get(loginRequired('cse'),wrapAsync(async(req,res)=>{
    if(await Client.count() > 0){
        lastRecord = await Client.find({}).skip(await Client.count() - 1)
        lastCode = lastRecord[0].clientCode
    }
    else{
        lastCode = 0
    }
    res.render('add-client',{lastCode})
}))
.post(loginRequired('cse'),wrapAsync(async(req,res)=>{
    const client = new Client(req.body)
    await client.save()
    req.flash('success',"Client added successfully")
    res.redirect('/client/all')
}))

router.route('/client/:id')
.delete(loginRequired('cse'),wrapAsync(async(req,res)=>{
    const {id} = req.params
    try{
        await Client.findByIdAndDelete(id)
        req.flash('success',"Client Deleted Successfully")
        res.redirect('/client/all')
    }catch(e){
        req.flash('error',"Client Not Found")
        res.redirect('/client/all')
    }
}))

module.exports = router