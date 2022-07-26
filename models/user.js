const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt  = require('bcryptjs');
const jwt =  require('jsonwebtoken');
const crypto = require('crypto');    // We can use nanoId or uuid or some other external package

const userSchema = new mongoose.Schema({
    
        name:{
            type: String,
            required: [true, 'Please provide a name'],
            maxlength: [40, 'Name should be under 40 char'],
        },
        
        email:{
            type: String,
            required: [true, 'Please provide a name'],
            validate: [validator.isEmail, 'Please enter email in correct format'],
            unique: true,
        },

        password:{
            type: String,
            required: [true, 'Please provide a password'],
            minlength: [8, 'Name should be atleast 8 char'],
            select: false,
        },

        role:{
            type: String,
            default: 'user',
        },
        
        profilePicture:{
            id:{
                type: String,
                required: true
            },
            secure_url:{
                type: String,
                required: true
            },
        },
        
        forgotPasswordToken: String,
        forgotPasswordExpiry: Date,
        createdAt: {
            type: Date,
            default: Date.now      // not Date.now()
        }
});


//  encrypt password before save   --  hooks
userSchema.pre('save', async function(next){
    if(!this.isModified('password'))  return next();
    this.password = await bcrypt.hash(this.password, 10);
});

// validate the password with passed on user password   (true or false)
userSchema.methods.isValidPassword =   async function(userSentPassword){
    return await bcrypt.compare(userSentPassword, this.password);
}

//  create and return jwt token
userSchema.methods.getJwtToken = function(){
    return jwt.sign(
        {id: this._id}, 
        process.env.JWT_SECRET, 
        {
            expiresIn: process.env.JWT_EXPIRY
        });
}

//  generate forgot password token (string)
userSchema.methods.getForgotPasswordToken = async function(){
    const forgotToken = crypto.randomBytes(20).toString('hex');
    
    // this.forgotPassswordToken = forgotToken;   
    // OR  more secure way can be :
    this.forgotPasswordToken = await crypto.createHash('sha256').update(forgotToken).digest('hex');
    
    // time of token expiry
    this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000;
    return forgotToken;
}

module.exports = mongoose.model("User", userSchema);