module.exports.loginRequired = (user) => {
    return (req,res,next) => {
        let index = 0
        if(Array.isArray(user)){
            user.every(u => {
                if(req.session.userPos != u){
                    index+=1
                }
            })
            if(index == user.length){
                return res.redirect('/login/'+user[0])
            }else{
                next()
            }
        }else{
            if(req.session.userPos!=user){
                return res.redirect('/login/'+user)
            }
            next();
        }
    }
}