const express = require('express');
const tourController = require('../controller/tourController');
const authController= require('./../controller/authController');
const router = express.Router();
const reviewController=require('./../controller/reviewController');
const reviewRouter=require('./../Routes/reviewRoutes');
// router.param('id', tourController.checkID);
// we can also check the body before creating that tour as it is having name and price add newTour function for that just we need to do this 
//.post(tourController.checkBody, tourController.addnewTour);

router.use('/:tourId/reviews',reviewRouter);

router.route('/top-5-cheapest-tour').get(tourController.aliasTopTour, tourController.getTour);

router.route('/top-stats').get(tourController.getStats);

router.route('/monthly-plan/:year').get(authController.protect,tourController.getMonthlyPlan);

//-25.308255, -57.646183
router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistance);
router
  .route('/')
  .get(tourController.getTour)
  .post(authController.protect,tourController.addnewTour);
router
  .route('/:id')
  .get(tourController.getTourById)
  .patch(authController.protect,tourController.updateTour)
  .delete(authController.protect,authController.restrictTo('admin' , 'lead-guide'),tourController.deleteTour);

  //POST /tour/234fdd/reviews
  //GET /tour/234fdd/reviews

  // router.route('/:tourId/reviews').post(authController.protect,
  //   //authController.restrictTo('user'),
  //   reviewController.createNewReview);
module.exports = router;
