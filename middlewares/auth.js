const BigPromise = require('../middlewares/bigPromises'); 
const CustomError = require('../utils/customError');



exports.authorization = BigPromise(async(req, res, next) => {
   
    const apiKey = req.query.apiKey;
    console.log("USER API - ", apiKey)
    if(apiKey !== process.env.API_KEY){
        return next(new CustomError('Please provide a valid api key', 401));
    }

    next();
}); 