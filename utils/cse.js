module.exports.checkCseVad = (req,res,next) => {
    if(req.session.city!='VAD'){
        req.flash('error',"You are not allowed to do that")
        return res.redirect('/material/all')
    }
    next()
}