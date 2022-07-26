const User = require('../models/user');
const BigPromise = require('../middlewares/bigPromises'); 
const CustomError = require('../utils/customError');
const jwt = require('jsonwebtoken');

exports.isLoggedIn = BigPromise(async(req, res, next) => {
    if(typeof req.cookies.token === 'undefined' && typeof req.header('Authorization') === 'undefined'){
        return next(new CustomError('Unauthorized Access Denied - not logged in'), 401);
    }
    const token = req.cookies.token || req.header('Authorization').replace("Bearer ","");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    next();
}); 

exports.customRole = (...roles) => {
    return(req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next(new CustomError('You are not allowed to access this resource'), 403)
        }
        next();
    }
};