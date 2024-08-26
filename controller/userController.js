 const User = require('./../Models/userModel');
 const AppError=require('./../utils/AppError');
 const factory = require('./../controller/handleFactory');
const filterObj = (obj , ...allowedFields)=>{
  const newObj={};
  Object.keys(obj).forEach(el =>{
    if(allowedFields.includes(el)){
      newObj[el]=obj[el]
    }
  } )
  return newObj;
}

 const catchAsync = fn =>{
  return (req,res,next) => {
     fn(req, res , next).catch(next);
  };
  };

  // exports.getAllUser = catchAsync(async(req, res , next ) => {
  //  const users=await User.find();
     
  //   //Send Reponse
  //   res.status(200).json({
  //     status:'success',
  //     results:users.length,
  //     data: {
  //     users
  //     }
  //   });
  // });

   exports.updateMe = catchAsync(async(req,res,next) => {
    // Create error if the user post the password data 
    if(req.body.password || req.body.passwordConfirm){
      return next(new AppError('This route is not for password update | Please use /updateMyPassword route for that' , 400))
    }

   //Filtered out unwanted fields that are not allowed to be updated
  const filterBody = filterObj(req.body , 'name' , 'email');
   // Update the user documents
  const updateUser= await User.findByIdAndUpdate(req.user.id, filterBody , {
    new : true , 
    runValidators:true
  } )

    res.status(200).json({
      status:'success',
      data: {
        user:updateUser
      }
    });
   }) 
  
   exports.getMe= (req,res,next) => {
    req.params.id = req.user.id;
    next();
   }

   exports.deleteMe = catchAsync(async( req , res , next ) =>{

    await User.findByIdAndUpdate(req.user.id , {active:false});
    
    
    res.status(204).json({
      status:'success',
      data:null
    })

  });



  exports.createNewUser = (req, res) => {
    res.status(500).json({
      status: 'Failed',
      message: 'This route  have not been generated . And it will never will be pls use signup instead',
    })
   };

 
  exports.getAllUser=factory.getAll(User);
  exports.getUsersById =factory.getOne(User);
  
  exports.updateUser =  factory.updateOne(User);
  exports.deleteUser = factory.deleteOne(User);