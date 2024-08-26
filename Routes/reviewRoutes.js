const express=require('express');
const authController= require('./../controller/authController');
const reviewController=require('./../controller/reviewController');
const router=express.Router({ mergeParams : true });

 router.use(authController.protect);
 router.route('/')
 .get(reviewController.getReviews)
 .post(
    // authController.restrictTo('user'),
    reviewController.setTourUserIds, 
    reviewController.createNewReview);
 
  router.route('/:id')
  .get(reviewController.getTheReviews)
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview) ;

module.exports=router;