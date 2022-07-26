const Product = require('../models/product');
const BigPromise = require('../middlewares/bigPromises'); 
const cloudinary = require('cloudinary');
const CustomError = require('../utils/customError');
const WhereClause = require('../utils/whereClause');


exports.getAllProducts = BigPromise(async (req, res, next) => {

    // Product.countDocuments()   //  gives total number of docs

    const productsObj = new WhereClause(Product.find(), req.query).search().filter();   

    let products = await productsObj.base;

    const totalResults = products.length;

    productsObj.pager();
    products = await productsObj.base.clone();

    res.status(200).json({
        success: true,
        totalResults,
        products,
    });
});

exports.getOneProduct = BigPromise(async (req, res, next) => {

    const product = await Product.findById(req.params.id);

    if(!product){
        return next(new CustomError('No Product found with this id', 400));
    }

    res.status(200).json({
        success: true,
        product,
    });
});

exports.addReview = BigPromise(async (req, res, next) => {

    const {rating, comment, productId} = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    }

    const product = await Product.findById(productId);

    const alreadyReviewed = product.reviews.find(rev => rev.user.toString() === req.user._id.toString());

    if(alreadyReviewed){
        product.reviews.forEach(review => {
            if(rev => rev.user.toString() === req.user._id.toString()){
                rev.comment = comment;
                review.rating = rating;
            }
        })
    }
    else{
        product.reviews.push(review);
        product.numberOfReviews = product.reviews.length
    }

    product.ratings = product.reviews.reduce((acc, items) => items.rating + acc, 0)/product.reviews.length;

    await product.save({validateBeforeSave: false})

    res.status(200).json({
        success: true,
    });
});

exports.deleteReview = BigPromise(async (req, res, next) => {

    const {productId} = req.query;

    const product = await Product.findById(productId);

    const reviews = product.reviews.filter(rev => rev.user.toString()=== req.user._id);

    const numberOfReviews = reviews.length;

    product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0)/ product.reviews.length;

    await Product.findByIdAndUpdate(productId, {
        reviews,
        ratings,
        numberOfReviewsiews
    },
    {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        message: 'review deleted'
    });
});

exports.addProduct = BigPromise(async (req, res,next) => {
    // images

    let imageArray = [];

    if(!req.files){
        return next(new CustomError('images are required'));
    }
    //  To handle single image
    if(!Array.isArray(req.files.photos)){
        req.files.photos = [req.files.photos];
    }

 

    for(let index = 0; index < req.files.photos.length; index++ ){
        let result = await cloudinary.v2.uploader.upload(req.files.photos[index].tempFilePath, {
            folder : 'products'
        });

        imageArray.push({
            id: result.public_id,
            secure_url : result.secure_url,
        });
    }

    req.body.photos = imageArray;
    req.body.user = req.user.id;

    const product = await Product.create(req.body);  // all validation in schema itself,  can also check individually

    res.status(200).json({
        success : true,
        product
    });
});

exports.adminGetAllProduct = BigPromise(async (req, res, next) => {
    const products = await Product.find();

        res.status(200).json({
            success:true,
            products,
        });
});

exports.adminUpdateOneProduct = BigPromise(async (req, res, next) => {
    
    let product = await Product.findById(req.params.id);

    if(!product){
        return next(new CustomError('No Product found with this id', 401));
    }

    if(req.files){
        // destroy existing images
        product.photos.forEach(async (photo) => {
            await cloudinary.v2.uploader.destroy(photo.id);
        });

        // upload new images
        let imageArray = [];

        //  To handle single image
        if(typeof(req.files.photos)==='object'){
            req.files.photos = [req.files.photos];
        }

        console.log(typeof(req.files.photos));

        for(let index = 0; index < req.files.photos.length; index++ ){
            let result = await cloudinary.v2.uploader.upload(req.files.photos[index].tempFilePath, {
                folder : 'products'
            });

            imageArray.push({
                id: result.public_id,
                secure_url : result.secure_url,
            });
        }

        req.body.photos = imageArray;     //  replacing photos with id and sec_url

    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body,{
        new : true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success:true,
        product,
    }); 
});

exports.adminDeleteOneProduct = BigPromise(async (req, res, next) => {
    
    const product = await Product.findById(req.params.id);

    if(!product){
        return next(new CustomError('No Product found with this id', 401));
    }

    if(req.files){
        // destroy existing images
        product.photos.forEach(async (photo) => {
            await cloudinary.v2.uploader.destroy(photo.id);
        });
    }

    await product.remove();

    res.status(200).json({
        success:true,
        message: 'product was deleted'
    }); 
});

