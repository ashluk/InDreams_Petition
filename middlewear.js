//this is if the user is not logged in
/*exports.requireLoggedInUser(req,res,next) => {
if (!req.session.userid) {
//this means that the user is not logged in
Res.redirect('/register');
}else{
next();
}
}*/

//this is if the user is logged in and required to be logged out
exports.requireLoggedOutUser = (req, res, next) => {
    if (req.session.userid) {
        res.redirect("/petition");
    } else {
        next();
    }
};

//this is if the user signed -- should go on the petition routes(bc the user shold not see that if they have signed)
exports.requireNoSignature = (req, res, next) => {
    if (req.session.signed) {
        return res.redirect("/thanks");
    }
    next();
};

//this is if the user has not signed -- would be used on thank you, signers, signers by city and delete routes
exports.requireSignature = (req, res, next) => {
    if (!req.session.signed) {
        return res.redirect("/petition");
    }
    next();
};

