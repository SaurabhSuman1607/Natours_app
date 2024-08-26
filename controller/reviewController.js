const Review = require('../Models/reviewModel');
const AppError=require('.././utils/AppError');
const factory=require('./../controller/handleFactory');

const catchAsync = fn =>{
  return (req,res,next) => {
     fn(req, res , next).catch(next);
  };
};


// exports.getReviews = catchAsync(async (req,res,next) => {
//  let filter = {};
// if(req.params.tourId) filter = { tour : req.params.tourId}
//     const allReviews = await Review.find(filter);
//     // const reviewData= await allReviews;

//     res.status(200).json({
//         status: 'success' ,
//         results:allReviews.length,
//         data:{
//            allReviews
//         }
//     })
// } );

exports.setTourUserIds = (req,res ,next ) => {
  if(!req.body.tour)  req.body.tour=req.params.tourId;
   if(!req.body.user)  req.body.user=req.user.id;
   next();
}


exports.getReviews = factory.getAll(Review);
exports.getTheReviews=factory.getOne(Review);
exports.createNewReview =factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);