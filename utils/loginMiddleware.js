module.exports.loginRequired = (user) => {
    return (req,res,next) => {
        // if(req.session.userPos!=user){
        //     return res.redirect('/login/'+user)
        // }
        next();
    }
}