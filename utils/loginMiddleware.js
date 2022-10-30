module.exports.loginRequired = (user) => {
    return (req,res,next) => {
        if(req.session.userPos!=user){
            res.redirect('/login/'+user)
        }
        next();
    }
}