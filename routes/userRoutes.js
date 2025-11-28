const express = require('express');
const router = express.Router();
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const { uploadUserPhoto } = require('../utils/multerConfig');

router.route('/login').post(authController.login);
router.get('/logout', authController.logout);
// router.route('/forgotPassword').post(authController.forgotPassword);
// router.route('/resetPassword/:token').patch(authController.resetPassword);

// Protect all routes after this middleware
router.use(authController.protect);

router.route('/updateMyPassword').patch( authController.updatePassword);
router.route('/updateMe').patch(uploadUserPhoto, userController.updateMe);
router.route('/me').get(userController.getMe, userController.getUser);
// router.route('/deleteMe').delete(userController.deleteMe);


//Restrict all routes below to admin only
router.use(authController.restrictTo('admin'))
router.route('/')
    .post(uploadUserPhoto, userController.createUser)
    .get(userController.getAllUsers)

router.route('/:id')
    .patch(uploadUserPhoto, userController.updateUser)
    .delete(userController.deleteUser)


module.exports = router;