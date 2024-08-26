
const sendErrorProd = (err,res) => {
  //Operational means the trusted error : send message to the client
   if(err.isOperational){
   res.status(err.statusCode).json({
      status:err.status,
      message:err.message   
     });    
   }
   else{
   //Programming some unknown error : DOn't leak that error to the client  
    console.error('ERROR PLS CHECK' , err);
   
   res.status(500).json({
    status:'error',
    message:'Something went wrong'
   })
   }
}

module.exports = (err,req,res,next) => {
  // console.log(err.stack);

  err.statusCode=err.statusCode || 500;
  err.status = err.status || 'error';

     
    
  //  if(process.env.NODE_ENV === 'production'){
  //   sendErrorProd();
  //  } 
     if(req.originalUrl.startsWith('/api')){
 res.status(err.statusCode).json({
     status:err.status ,
     error:err , 
     message:err.message , 
     stack: err.stack
  });
     }
     else {
      res.status(err.statusCode).render('error' , {
        title: 'Something went wrong',
        msg:err.message
      })
     }
}