const User = require('../models/user');
const BigPromise = require('../middlewares/bigPromises'); 
const CustomError = require('../utils/customError');
const cookieToken = require('../utils/cookieToken');
const cloudinary = require('cloudinary');
const crypto = require('crypto');
const mailHelper = require('../utils/emailHelper');

exports.signup = BigPromise(async (req, res, next) => {
    
    const {name, email, password} = req.body;

    if(!(email && name && password)){
        return next(new CustomError('Name, Email and Password are required', 400));
    }

    const existingUser = await User.findOne({email});
    if(existingUser){
        return next(new CustomError('User Already Exists', 400));
    }

    // profile picture handling
    let result;
    if(req.files){
        let file = req.files.photo
        result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
            folder: "users",
            width: 150,
            crop: "scale"
        });
    }

    const user = await User.create({
        name,
        email,
        password,
        profilePicture:{
            id: result.public_id,
            secure_url: result.secure_url,
        }
    });
    
    cookieToken(user, res);
});

exports.login = BigPromise(async (req, res, next) => {
    const {email, password} = req.body;

    if(!(email && password)){
        return next(new CustomError('please provide email and password', 400));
    }

    // getting user from db 
    const user = await User.findOne({email}).select('+password');

    if(!user){
        return next(new CustomError('you are not registered in our database', 400));
    }
   
    const isPasswordCorrect = await user.isValidPassword(password);

    if(!isPasswordCorrect){
        return next(new CustomError("email & password do not match", 400));
    }

    // sends the token
    cookieToken(user, res);
});

exports.logout = BigPromise(async (req, res, next) => {
    res.cookie('token', null,{
        expires: new Date(Date.now()),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: "Logout Success",
    });
});

exports.forgotPassword = BigPromise(async (req, res, next) => {
    const {email} = req.body;

    const user = await User.findOne({email});

    if(!user){
        return next(new CustomError('Email Not Found'));
    }

    const forgotToken = await user.getForgotPasswordToken();

    await user.save({validateBeforeSave: false});

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${forgotToken}`;

    const message = `Click on the link below to reset your password \n\n ${resetUrl}`;

    try{
        await mailHelper({
            email,
            subject: "TshirtStore - Password Reset Email",
            message,
        });
        res.status(200).json({
            success: true,
            message: "Email sent sucessfully",
        });

    } catch(error){
        user.forgotPasswordToken = undefined;
        user.forgotPasswordExpiry = undefined;
        user.save();
        return next(new CustomError(error.message, 500));
    }
});

exports.resetPassword = BigPromise(async (req, res, next) => {
    const forgotToken = req.params.token;

    const encryptToken = await crypto.createHash('sha256').update(forgotToken).digest('hex');

    const user = await User.findOne({forgotPasswordToken: encryptToken, forgotPasswordExpiry: {$gt: Date.now()}});

    if(!user){
        return next(new CustomError('Token is invalid or expired'), 400);
    }

    user.password = req.body.password;
    await user.save();

    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save();

    res.status(200).json({
        success: true,
        message: 'Password has been changed',
    });

});

exports.getLoggedInUserDetails = BigPromise(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user,
    });
});

exports.updatePassword = BigPromise(async (req, res, next) => {
    const userId = req.user.id;

    const user = await User.findById(userId).select('+password');

    const isOldPasswordCorrect = await user.isValidPassword(req.body.oldPassword);

    if(!isOldPasswordCorrect){
        return next(new CustomError('old password is incorrect', 400));
    }

    user.password = req.body.newPassword;

    await user.save();

    cookieToken(user, res);
});

exports.updateUserInfo = BigPromise(async (req, res, next) => {
    const userId = req.user.id;

    const newData = {
        name: req.body.name,
        email: req.body.email,
    }

    let result;
    if(req.files){
        const user = await User.findById(userId);

        const imageId = user.profilePicture.id;

        // delete old photo
        const resp = await cloudinary.v2.uploader.destroy(imageId);

        // upload new photo
        result = await cloudinary.v2.uploader.upload(req.files.photo.tempFilePath, {
            folder: "users",
            width: 150,
            crop: "scale"
        });

        // adding new image id to newData object
        newData.profilePicture = {
            id: result.public_id,
            secure_url: result.secure_url
        }

    }

    const user = await User.findByIdAndUpdate(userId, newData, {
        new: true,   // grab the new updated data from tha db
        runValidators: true,
        useFindAndModify: false,
    });
    
    res.status(200).json({
        success: true,
        user,
    })


});

exports.adminAllUsers = BigPromise(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        users,
    });
});

exports.adminGetOneUser = BigPromise(async (req, res, next) => {
   const user = await User.findById(req.params.id);

   if(!user){
    next(new CustomError('No user found', 400));
   }

   res.status(200).json({
    success: true,
    user,
   })
});
// TODO
exports.adminUpdateOneUser = BigPromise(async (req, res, next) => {

    const newData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
    }

    const user = await User.findByIdAndUpdate(req.params.id, newData, {
        new: true,   // grab the new updated data from tha db
        runValidators: true,
        useFindAndModify: false,
    });
    
    res.status(200).json({
        success: true,
        user,
    })


});


// Just extended for learning purpose for creating more roles
exports.managerAllUsers = BigPromise(async (req, res, next) => {
    const users = await User.find({role:'user'});

    res.status(200).json({
        success: true,
        users,
    });
});

exports.adminDeleteOneUser = BigPromise(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new CustomError('No such user found', 401));
    }

    const imageId = user.profilePicture.id;

    await cloudinary.v2.uploader.destroy(imageId);

    await user.remove();

    res.status(200).json({
        success: true,
        message: 'user deleted',
    })
});