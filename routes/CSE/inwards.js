const express = require('express')
const router = express.Router({mergeParams:true})
const {loginRequired} = require('../../utils/loginMiddleware')
const Client = require('../../models/Client')
const Material = require('../../models/Material')
const Inward = require('../../models/Inward')
const wrapAsync = require('../../utils/wrapAsync')

// new inward GET and POST routes /new, new/:id, new/:id/save
// POST,PUT,DELETE routes to add,remove and delete tests from inward /:inwardId/:sampleNo
// pending inwards GET
// performa GET
// Show page for inward /:id GET

router.route('/new')
.get(loginRequired('cse'),wrapAsync(async(req,res)=>{
    if(req.cookies.inward){
        return res.redirect('/inward/new/tests')
    }
    const {city} = req.session
    const clients = await Client.find({cse:city})
    res.render('cse/inwards/new-inward',{clients})
}))
.post(loginRequired('cse'),wrapAsync(async(req,res)=>{
    const {city} = req.session
    const {client,inward} = req.body
    const currClient = await Client.findById(client)
    const start = new Date('04/01/2022')
    const today = new Date()
    const daysDiff = Math.ceil(Math.abs(today-start)/(1000*60*60*24))
    let jobOfTheDay = 0
    if(await Inward.count() > 0){
        lastRecord = await Inward.find({}).skip(await Inward.count() - 1)
        lastDate = lastRecord[0].jobId.split('/')[2]
        if(lastDate==daysDiff){
            jobOfTheDay = Number(lastRecord[0].jobId.split('/')[3])+1
        }
    }
    const jobId = `${city}/${currClient.clientCode}/${daysDiff}/${jobOfTheDay}`
    const newInward = new Inward({name:inward,city,client,jobId})
    res.cookie('inward',newInward);
    res.redirect('/inward/new/tests')
}))

router.route('/new/tests')
.get(loginRequired('cse'),wrapAsync(async(req,res)=>{
    const materials = await Material.find({}).populate('physical').populate('chemical').populate('other')
    res.render('cse/inwards/add-tests',{inward:req.cookies.inward,materials})
}))

module.exports = router