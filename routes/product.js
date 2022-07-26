const express = require('express');
const router = express.Router();
const { isLoggedIn, customRole } = require('../middlewares/user');

const {addProduct, getAllProducts, adminGetAllProduct, getOneProduct, adminUpdateOneProduct, adminDeleteOneProduct, addReview, deleteReview} = require('../controllers/productController')

//  user routes
router.route('/products').get(getAllProducts);
router.route('/addReview').post(addReview);
router.route('/addReview').delete(deleteReview);
router.route('/product/:id').get(getOneProduct);

//  admin routes
router.route('/createProduct').post(isLoggedIn, customRole('admin') , addProduct);
router.route('/admin/products').get(isLoggedIn, customRole('admin') , adminGetAllProduct);
router.route('/admin/product/:id')
                        .put(isLoggedIn, customRole('admin') , adminUpdateOneProduct)
                        .delete(isLoggedIn, customRole('admin') , adminDeleteOneProduct);


module.exports = router;