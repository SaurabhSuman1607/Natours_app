// const fs = require('fs');
const { request } = require('express');
const Tour = require('./../Models/tourModel');
const apiFeatures=require('./../utils/apiFeatures');
const AppError = require('../utils/AppError');
const factory=require('./handleFactory')

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// exports.checkID = (req, res, next, val) => {
//   console.log(`Middleware is woking for checking the  id ${val}`);
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'Failed',
//       data: 'Invalid id',
//     });
//   }
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'failed',
//       message: 'Missing name and price',
//     });
//   }
//   next();
// };

exports.aliasTopTour = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'price,-ratingsAverage';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty,duration';
  next();
}

const catchAsync = fn =>{
  return (req,res,next) => {
     fn(req, res , next).catch(next);
  };
};

exports.getTour = catchAsync(async (req, res , next) => {
  
    const features = new apiFeatures(Tour.find(), req.query).filter().sort().limiting().pagination();
    const tours = await features.query;

    //const tours = await features.query.explain();
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
});


exports.getTourById = catchAsync(async (req, res , next) => {
    const tour = await Tour.findById(req.params.id).populate('reviews');
    
    //Tour.findOne({_id: req.params.id })

     if(!tour){
      return next(new AppError('No tour found in the ID' , 404));
     }
    
    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
 
});

exports.addnewTour = catchAsync(async (req, res , next) => {
 
    /* res.send('Done'); */
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    });
  
});

exports.updateTour = catchAsync(async (req, res , next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if(!tour){
      return next(new AppError('No tour found in the ID' , 404));
     }

    res.status(200).json({
      status: 'Successfull',
      data: {
        tour,
      },
    })
});

// exports.deleteTour=factory.deleteOne(Tour);

exports.deleteTour = catchAsync(async (req, res , next ) => {

   const tour = await Tour.findByIdAndDelete(req.params.id);

   console.log(tour);
     if(!tour){
      return next(new AppError('No tour found in the ID' , 404));
     }

    res.status(204).json({
      status: 'success',
      message: null,
    });
});

exports.getStats = catchAsync(async (req,res,next) => {
  
    const stats= await Tour.aggregate([
      {
       $match : {
         ratingsAverage : {$gte : 4.5}      
        }
      },
      {
        $group : {
          _id:'$difficulty',
          numOfTours: {$sum : 1 },
          numRatings : {$sum : '$ratingsQuantity'},
          avgRating: { $avg : '$ratingsAverage'},
          avgPrice: { $avg : '$price'},
          minPrice : {$min : '$price'},
          maxPrice: { $max : '$price'},
        }
      } ,
      {
        $sort : {
          avgPrice : 1
        }
      }   
  ]);
   res.status(200).json({
      status: 'Successfull',
      data: {
        stats,
      },
    });
 

});

exports.getMonthlyPlan = catchAsync(async (req,res,next) => {
   
   const year = req.params.year * 1 ; // we did to convert it into the integer from string
   const plan =await Tour.aggregate([
    {
      $unwind : '$startDates'
    },
    {
    $match : {
        startDates : {
           $gte : new Date(`${year}-01-01`),
           $lte: new Date(`${year}-12-31`),
        }
    }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum : 1},
        tours: { $push : '$name'  }
      }
    },
    {
      $addFields : { month : '$_id'}
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numTourStarts : -1 }
    },
    {
      $limit: 12
    }

   ]);
 res.status(200).json({
      status: 'Successfull',
      data: {
        plan,
      },
    });
 
});


 exports.getToursWithin = async (req,res,next) => {
  const { distance , latlng , unit }= req.params;
  const [lat , lng] = latlng.split(',');
  
  const radius = unit === 'mi'? distance / 3963.2 : distance / 6378.1;

  if(!lat || !lng){

    next( new AppError('Please provide the longitude and latitude in the format lat , lng',400));
  }


  const tours = await Tour.find({ 
    startLocation: {$geoWithin : {$centerSphere : [[lng , lat] , radius]}}
  });

  res.status(200).json({
    status : 'success' ,
    results : tours.length, 
    data:{
      data: tours
    }
  }) 
 }

 exports.getDistance = catchAsync( async(req , res ,next ) => {
   const {  latlng , unit }= req.params;
  const [lat , lng] = latlng.split(',');
  
  
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if(!lat || !lng){

    next( new AppError('Please provide the longitude and latitude in the format lat , lng',400));
  }
  
  const distances = await Tour.aggregate([
    {
    $geoNear: {
      near: {
        type: 'Point',
        coordinates: [lng * 1 , lat * 1]
      },
      distanceField: 'distance',
      distanceMultiplier:multiplier
    }
   },
   {
       $project : {
        distance : 1,
        name : 1
       }
   }
  ]);

   res.status(200).json({
    status : 'success' ,
    
    data:{
      data: distances
    }
  }) 
   
 })