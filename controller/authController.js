const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const dotenv=require('dotenv');
const AppError=require('./../utils/AppError')
const User=require('./../Models/userModel');
// const catchAsync = require('./../utils/catchAsync');
const sendEmail=require('./../utils/email');
const { truncate } = require('fs');

const catchAsync = fn =>{
  return (req,res,next) => {
     fn(req, res , next).catch(next);
  };
};

const signToken = id => {
   return jwt.sign({id } , 'this-is-my-first-jwt-authentication-and-authorisation',{
        expiresIn:'90d'
    });
}

const createSendToken = (user , statusCode , res) => {
  const token=signToken(user._id);
   const cookieOptions = {
    expires: new Date(
      Date.now() +  24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  res.cookie('jwt', token, cookieOptions);
//Remove password from the outuput
  user.password=undefined;
  res.status(statusCode).json({
    status:'success',
    token,
    data: {
      user
    }
  });
};

exports.signup= catchAsync(async (req,res,next) => {

    const newUser = await User.create({
       name:req.body.name,
       email:req.body.email,
       password:req.body.password,
       passwordConfirm:req.body.passwordConfirm
    });
   
    // const token=signToken( newUser._id);

  // Basically we logged the user in sending the JWT tokens in it 
    // res.status(201).json({
    //     status:'success',
    //     token,
    //     data:{
    //         user:newUser
    //     }
    // });
    createSendToken( newUser, 201 , res);
});

exports.login = catchAsync(async (req,res,next) =>{
  
    const {email,password} = req.body;

    // 1) First check if the email and password does exsist or not
     if(!email || !password){
          return next(new AppError('Please provide the email and password' , 400));
     }
    // 2) Check if the user exsist and password is there or not
      const user = await  User.findOne({ email }).select('+password');


      if(!user || !( await user.confirmPasswords(password , user.password))){
        return next(new AppError('Incorrect email and password', 401));
      }

    // 3) If everything is ok , then send the token to the client
    createSendToken( user, 200 , res);
});

exports.logout = (req,res) => {
  res.cookie('jwt' , 'loggedout' , {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly:true 
  });

  res.status(200).json({status: 'success'});
};

exports.protect = catchAsync(async ( req , res , next ) => {
 // First getting the token and check if it is true
   
   let token;

   if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
    token=req.headers.authorization.split(' ')[1];
   }
   else if(req.cookies.jwt){
    token=req.cookies.jwt;
   }
  //  console.log(token);
  
   if(!token){
    return next(new AppError('You are not logged in . Please log yourself in ', 401));
   }
  
  //Verification of the token 
  const decoded = await promisify(jwt.verify)(token , 'this-is-my-first-jwt-authentication-and-authorisation'  );
  
  //Check if the user still exsist
   const currentUser= await User.findById(decoded.id);
   if( !currentUser ){
    return next(new AppError('The user belong to the token does not exsist  ' , 401 ));
   }

  //Check if the user changed password after the token was issued
   
  if(currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed the password | pleas login again',401));
  }
  
  // Grant access to the protected route
  req.user = currentUser;
   res.locals.user= currentUser;
  next();

})

//Only for rendered pages , no error
exports.isLoggedIn =  async ( req , res , next ) => {
 
   if(req.cookies.jwt){
      try{
  //  console.log(token);
  //Verification of the token 
  const decoded = await promisify(jwt.verify)(req.cookies.jwt , 'this-is-my-first-jwt-authentication-and-authorisation'  );
  
  //Check if the user still exsist
   const currentUser= await User.findById(decoded.id);
   if( !currentUser ){
    return next();
   }

  //Check if the user changed password after the token was issued
   
  if(currentUser.changedPasswordAfter(decoded.iat)) {
    return next();
  }
  
  // There is a logged in user
  res.locals.user= currentUser;
  return next();
   } catch(err){
    console.log(err);
   return next();
}
   }
  
   next();
}

exports.restrictTo = (...roles) => {
   return (req,res, next) => {
    // roles are [admin , lead-guide  ] , roles='user'
    if(!roles.includes(req.user.role)){
      return next(new AppError('You do not have permission to do that action' , 403));
    }
   }
   next();
}

exports.forgotPassword = catchAsync( async (req, res , next) => {
  // get the user based on Posted email
   const user =await User.findOne({email : req.body.email});
   
    if(!user){
      return next(new AppError('There is no user with this email ' , 404));
    } 

  // Generate the random reset token
  const resetToken  =  user.createPasswordResetTokens();
 
  await user.save({validateBeforeSave: false});

  // Send it to the users email
  const resetURL=`${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}` ;

  const message=`Forgot the password ? Submit a patch request for the new password and passwordConfirm to: ${resetURL}. \n 
    IF you didn't forget your password please ignore this email !  `

     try {
    await sendEmail({
      email : user.email,
      subject : 'Your Password reset token is only valid for 10 mins ',
      message 
    });

    res.status(200).json({
      status:'success',
      message:'Token sent to the Recovery email'
    })
  } catch(err){
    user.passwordResetToken= undefined;
    user.passwordResetExpires=undefined;
    console.log(err);
    return next(new AppError('There was an error sending the email . Try again Later ! '),500);
  }
});

exports.resetPassword = catchAsync(async(req,res,next) => {
  //1 Get the user Token
  const hashToken =  crypto.createHash('sha256').update(req.params.token).digest('hex');
 
  const user = await User.findOne({passwordResetToken: hashToken,
   passwordResetExpires: { $gt : Date.now()}
  });

  //If token is not expired and there is user then set the new password
  if(!user){
    return next(new AppError('Token is invalid or it is expired' , 404) )
  }

  user.password = req.body.password;
  user.passwordConfirm=req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires=undefined;
  await user.save();
  //Update the change password at user 

  //Log the user in and send the jwt
  //  const token = signToken( user._id);
  //   res.status(200).json({
  //       status:'success',
  //       token  
  //   });

  createSendToken(user, 200 ,res);
})

exports.updatePassword = catchAsync(async(req,res,next) => {
  
  // Get the user from collection
   const user = await User.findById(req.user.id).select('+password')
   
  
  //Check if the posted current password is correct
  if(!(await user.confirmPasswords(req.body.passwordCurrent , user.password ))){
    return next(new AppError('Your current password is wrong' , 401));
  }
  
  //IF so update the password
 user.password=req.body.password;
 user.passwordConfirm=req.body.passwordConfirm;
 await user.save();
  
  //Log user In send the JWT password
  //  const token = signToken( user._id);
  //   res.status(200).json({
  //       status:'success',
  //       token  
  //   });

  createSendToken(user, 200 , res);

});