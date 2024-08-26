const express = require('express');
const userController=require('../controller/userController');
const authController=require('../controller/authController');
const router = express.Router();

router.post('/signup' , authController.signup);
router.post('/login' , authController.login);
router.get('/logout' , authController.logout);
router.post('/forgotPassword' , authController.forgotPassword );
router.patch('/resetPassword/:token' , authController.resetPassword );
//Middleware run in the sequence after that all of the routes need an autorization
router.use(authController.protect);

router.get('/me',userController.getMe,userController.getUsersById);

router.patch('/updateMyPassword'  , authController.updatePassword);
router.patch('/updateMe'  , userController.updateMe);
router.delete('/deleteMe'  , userController.deleteMe);

// router.use(authController.restrictTo('admin'));
router.route('/').get(userController.getAllUser).post(userController.createNewUser);
router.route('/:id').get(userController.getUsersById).patch(userController.updateUser).delete(userController.deleteUser);
module.exports = router;


