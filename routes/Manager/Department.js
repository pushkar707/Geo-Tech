const express = require('express')
const router = express.Router({mergeParams:true})
const {loginRequired} = require('../../utils/loginMiddleware')
const ManagerInfo = require('../../models/ManagerInfo')
const Department = require('../../models/Department')
const Order = require('../../models/Order')

module.exports = router