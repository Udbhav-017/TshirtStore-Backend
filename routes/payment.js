const express = require('express');
const { sendStripeKey, sendRazorpayKey, captureRazorpayPayment, captureStripePayment } = require('../controllers/paymentController');
const router = express.Router();
const { isLoggedIn, } = require('../middlewares/user');

router.route('/stripekey').get(isLoggedIn, sendStripeKey);
router.route('/stripekey').get(isLoggedIn, sendRazorpayKey);

router.route('/capturestripe').get(isLoggedIn, captureStripePayment);
router.route('/capturerazorpay').get(isLoggedIn, captureRazorpayPayment);

module.exports = router;