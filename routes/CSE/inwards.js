const express = require('express')
const router = express.Router({mergeParams:true})
const {loginRequired} = require('../../utils/loginMiddleware')
const Client = require('../../models/Client')
const Material = require('../../models/Material')
const wrapAsync = require('../../utils/wrapAsync')

// new inward GET and POST routes /new, new/:id, new/:id/save
// POST,PUT,DELETE routes to add,remove and delete tests from inward /:inwardId/:sampleNo
// pending inwards GET
// performa GET
// Show page for inward /:id GET

router.route('/new')
.get(loginRequired('cse'),wrapAsync(async(req,res)=>{
    res.render('/cse/inwards/new-inward')
}))

module.exports = router