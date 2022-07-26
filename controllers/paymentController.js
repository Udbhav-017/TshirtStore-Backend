const BigPromise = require('../middlewares/bigPromises'); 
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const razorpay = require('razorpay');

exports.sendStripeKey = BigPromise(async (req, res, next) => {
    res.status(200).json({
        stripekey: process.env.STRIPE_API_KEY
    });
});

exports.captureStripePayment = BigPromise(async (req, res, next) =>{
    
    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: 'inr',
        automatic_payment_methods: {enabled: true},

        metadata: {integration_check: ' accept_a_payment'}  
      });

      res.status(200).json({
        success : true,
        amount: req.body.amount,
        client_secret : paymentIntent.client_secret,
      });
});

exports.sendRazorpayKey = BigPromise(async (req, res, next) => {
    res.status(200).json({
        stripekey: process.env.RAZORPAY_API_KEY
    });
});

exports.captureRazorpayPayment = BigPromise(async (req, res, next) => {
    var instance = new Razorpay({ key_id: process.env.RAZORPAY_API_KEY, key_secret: process.env.RAZORPAY_SECRET });

    const myOrder = await instance.orders.create({
        amount: req.body.amount,
        currency: "INR",
    });

    res.ststus(200).json({
        success: true,
        amount: req.body.amount,
        myOrder,
    })
});