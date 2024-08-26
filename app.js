const express = require('express');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const rateLimit=require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize=require('express-mongo-sanitize');
const xss=require('xss-clean');
const cookieParser=require('cookie-parser');
const hpp = require('hpp');
const globalErrorHandler = require('./controller/errController.js');
const tourRouter = require('./Routes/tourRoutes');
const userRouter = require('./Routes/userRoutes');
const appError = require('./utils/AppError.js');
const reviewRouter=require('./Routes/reviewRoutes.js')
const viewRouter=require('./Routes/viewRoutes.js');

const app = express();

app.set('view engine' , 'pug');
app.set('views' , path.join(__dirname , 'views'))

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//set security to HTTP header
app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          // ... other directives
        "script-src": [
        "'self'", // allow scripts from your own domain
        "'unsafe-inline'", // allow inline scripts (you may want to remove this depending on your needs)
        "https://api.mapbox.com", // allow scripts from the Mapbox CDN
        "https://cdnjs.cloudflare.com"
        ],
          "worker-src": [
            "'self'", // allow web workers from your own domain
            "http://localhost:8000", // allow web workers from the current host (development environment)
            "https://api.mapbox.com", // allow web workers from the Mapbox CDN
            "blob:", // allow web workers from blob URLs
            "https://cdnjs.cloudflare.com"
            ],
        "connect-src": [
            "'self'", // allow connections to your own domain
            "https://api.mapbox.com", // allow connections to the Mapbox API
            "https://events.mapbox.com", // allow connections to Mapbox events
            "https://cdnjs.cloudflare.com"
            ],
        },
      },
    })
  );
// MIDDLEWARES

//Limit the request from the same api
const limiter= rateLimit({
  max:100 ,
  windowMs:60*60*1000,
  message:'Too many request from this Ip , please try again later in an hour'
})

app.use('/api' , limiter);

//Body parser reading data from body to req.body
app.use(express.json({limit : '10kb'}));
app.use(cookieParser());
app.use(express.urlencoded({extended:true , limit:'10kb'}));
// Data sanatization again noSql query injection
//it will check the req.body , req.queryString and it will remove all the . and $ from there and sanatize it 
app.use(mongoSanitize());


//Data sanatization against the XSS(cross site scripting)
// IT will remove all the malicious HTML scripts in the js and prevent us to inject 
app.use(xss());

//Prevent parameter pollution> it clear up the query string
app.use(hpp({
  whitelist:[
    'duration', 'ratingQuantity' , 'ratingsAverage','maxGroupSize','difficulty','price'
  ]
}));

//Test middleWare
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

//Serving static file
//All the static asset will always be seved from the folder called public 
app.use(express.static(`${__dirname}/public`));

// app.get('/api/v1/tours/:id', getTourById);
//  app.post('/api/v1/tours', addnewTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/c1/tours/:id', deleteTour);

// ROUTES
//Mounting of the routers these are



app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews',reviewRouter);

app.all('*' , (req,res,next) => {
  // res.status(404).json({
  //   status:'fail',
  //   message:`Can't find the ${req.originalUrl} in the server`
  //  const err = new Error(`Can't find the ${req.originalUrl} on this server`);
  //  err.status='fail';
  //   err.statusCode=404;

       next(new appError(`Can't find the ${req.originalUrl} on this server` , 404));
});


app.use(globalErrorHandler);

module.exports = app;
