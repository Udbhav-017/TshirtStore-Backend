const express = require('express');
const { createOrder, getOneOrder, getLoggedInOrders, adminGetAllOrders, adminUpdateOneOrder, adminDeleteOrder } = require('../controllers/ordercController');
const router = express.Router();

const { isLoggedIn, customRole } = require('../middlewares/user');

router.route('/order/create').post(isLoggedIn, createOrder);
router.route('/order/myorders').get(isLoggedIn, getLoggedInOrders);    // order matter     first
router.route('/order/:id').get(isLoggedIn, getOneOrder);              // order matters    second

router.route('/admin/orders').get(isLoggedIn, customRole('admin') ,adminGetAllOrders);
router.route('/admin/order/:id').put(isLoggedIn, customRole('admin') , adminUpdateOneOrder)
                                .delete(isLoggedIn, customRole('admin') , adminDeleteOrder)



module.exports = router;