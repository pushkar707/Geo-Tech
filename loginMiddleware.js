module.exports.loginRequired = (req,res,next)=>{
    if(!req.session.user_id){
        return res.redirect('/login')
    }
    next()
}

module.exports.adminLoginRequired = (req,res,next) => {
    if(!req.session.admin){
        return res.redirect('/login/admin')
    }
    next();
}

module.exports.cseLoginRequired = (req,res,next) => {
    if(!req.session.cse){
        return res.redirect('/login/cse')
    }
    next();
}

module.exports.managerLoginRequired = (req,res,next) => {
    if(!req.session.manager){
        return res.redirect('/login/manager')
    }
    next();
}

module.exports.accountsLoginRequired = (req,res,next) => {
    if(!req.session.accounts){
        return res.redirect('/login/accounts')
    }
    next();
}

module.exports.courierLoginRequired = (req,res,next) => {
    if(!req.session.courier){
        return res.redirect('/login/courier')
    }
    next();
}
