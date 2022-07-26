const express = require('express');
const router = express.Router();

const {signup, login, logout, forgotPassword, resetPassword, getLoggedInUserDetails, updatePassword, updateUserInfo, adminAllUsers, managerAllUsers, adminGetOneUser, adminUpdateOneUser, adminDeleteOneUser} = require('../controllers/userController');
const { isLoggedIn, customRole } = require('../middlewares/user');

router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/forgotpassword').post(forgotPassword);
router.route('/password/reset/:token').post(resetPassword);
router.route('/userdashboard').get(isLoggedIn ,getLoggedInUserDetails);
router.route('/password/update').post(isLoggedIn ,updatePassword);
router.route('/userdashboard/update').post(isLoggedIn ,updateUserInfo);

// admin only routes
router.route('/admin/users').get(isLoggedIn , customRole('admin'),adminAllUsers);
router.route('/admin/user/:id')
.get(isLoggedIn , customRole('admin'),adminGetOneUser)
.put(isLoggedIn , customRole('admin'),adminUpdateOneUser)
.delete(isLoggedIn , customRole('admin'),adminDeleteOneUser)



//  manager only route
router.route('/manager/users').get(isLoggedIn , customRole('manager'),managerAllUsers);

module.exports = router;