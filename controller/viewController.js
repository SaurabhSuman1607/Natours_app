const Tour= require('../Models/tourModel');
const AppError= require('../utils/AppError');
const User=require('../Models/userModel');
const catchAsync = fn =>{
  return (req,res,next) => {
     fn(req, res , next).catch(next);
  };
};


exports.getOverview = catchAsync( async(req,res) => {
  // Get the Tour data from the collection
    const tours = await Tour.find();
 
    //Build Templates

  //Render the template using the tour data at first
    res.status(200).render('overview' , {
    title: 'All Tours',
    tours
  });
})

exports.getTour = catchAsync(async (req,res,next) => {
 //Get the data for the requested tour  (including reviews and the guide)
 const tour = await Tour.findOne({slug : req.params.slug}).populate({
  path:'reviews',
  fields:'review rating user'
 });
 // Build the template
 if(!tour){
  return next(new AppError('There is no tour with the same name', 404))
  }

 //Render the template to using data from 1

  res.status(200).render('tour' , {
    title: `${tour.name}` ,
    tour
  });
})

exports.getLoginForm = catchAsync(async (req,res,next) => {
  res.status(200).render('login', {
    title:'Log into your account'
  } )

})


exports.getAccount = (req,res) => {
   res.status(200).render('account', {
    title:'Your account'
  } );

}

exports.updateUserData = catchAsync(async(req , res , next) => {
 const updateduser = await User.findByIdAndUpdate(req.user.id ,
   {
  name:req.body.name,
  email:req.body.email
 },
{
  new:true,
  runValidators:true
}) ; 

 res.status(200).render('account', {
    title:'Your account',
    user:updateduser

  } );
});