const mongoose = require('mongoose');
const slugify = require('slugify');
const validator=require('validator'); 
// const User=require('../Models/userModel')

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must be there'], //It should be there or called validation
    unique: true,
    trim: true,
    maxLength:[40 , 'A tour must have less then 40 characters'],
    minLength:[10 , 'A tour must have more then 10 characters'],
    // Validate:[validator.isAlpha , 'A tour name must have only alphabates in it ' ]
  },
  slug: String , 
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a maximum group size'],
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
    enum : {
     values :['easy' , 'medium' , 'difficult'],
      message:'It must be easy , medium or difficult'
    }
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min:[1.0,'A tour must have more then 1 rating'],
    max:[5.0 , 'A tour must have less then 5 rating'],
    set : val => Math.round(val * 10) / 10
  },
  ratingQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'], // validation it must be true..
  },
  priceDiscount:  {
    type: Number,
     validate : {
      // this is a custom validator that has been used here. Only will work on creation of the new tour because of this keyword will
      // only be available there . 
      validator : function(val){
      return val < this.price;
      },
       message : 'The discount ({VALUE}) must be lesser then the actual price'
     } 
  },
  summary: {
    type: String,
    trim: true, // remove all the wide spaces from the beginning and the ending only works on string schema
    required:[true,'A tour must have a summary']
  },
   description:{
    type:String,
    trim: true
   },
   imageCover:{
    type:String,
    required:[true,'A tour must have a cover image']
   },
   images:[String],
   createdAt:{
    type:Date,
    default:Date.now(),
    select: false
   },
   startDates:[Date],
   secretTour: {
    type:Boolean,
    default:false
   },
   startLocation: {
    //GEOJSON
  type:{
    type:String,
    default:'Point',
    enum:['Point'] 
  },
  coordinates:[Number],
  address:String,
  description:String
   },
   locations:[
    //We embedd it here by creating an array of the object and create a brand new documents 
    //inside the parent docment that is the tour
    {
     type:{
      type:String,
      default:'Point',
      enum:['Point']
     },
     coordinates: [Number],
     address: String,
     description: String,
     day: Number
    }
   ],
   guides:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:'User_UPD'
    }   
   ]
} ,
 {
  toJSON : { virtuals:true},
  toObject: {virtuals:true }
});

tourSchema.virtual('durationWeeks').get(function(){
  return this.duration / 7;
}) 

//DOCUMENT MIDDLEWARE : run before .save() and .create()
tourSchema.pre('save', function(next){
  this.slug=slugify(this.name  , { lower : true });
  next();
});


// tourSchema.pre('save' ,async function(next){
//   const guidesPromises=this.guides.map(async id => await User.findById(id));
//   this.guides=await Promise.all(guidesPromises);
//   next();
// })
// tourSchema.pre('save', function(next){
//   console.log('This will save documts');
//   next();
// });

// tourSchema.post('save' , function(doc,next) {
//   console.log(doc);
//   next();
// });

//Query MiddleWare

tourSchema.pre(/^find/ , function(next){
  this.find({secretTour : {$ne : true}});
  this.start = Date.now();
  next();
})
tourSchema.pre(/^find/ , function(next){
 this.populate({
      path: 'guides',
      select: '-__v -passwordChangedAt'
    });
  next();
})

tourSchema.post(/^find/, function(docs , next){
 console.log(`Query is taking ${Date.now() - this.start} milliseconds ! `); 
//  console.log(docs);
  next();
})

// tourSchema.index({ price : 1});
tourSchema.index({ price : 1 , ratingsAverage:-1});
tourSchema.index({ slug : -1});
tourSchema.index({ startLocation :  '2dsphere'})

// Virtual populate
tourSchema.virtual('reviews' , {
  ref: 'Reviews',
  foreignField: 'tour',
  localField:'_id'
})

//Aggregate Middleware
// tourSchema.pre('aggregate', function(next){
//  this.pipeline().unshift({$match : {secretTour: {$ne : true}}});
//  console.log(this.pipeline());
//   next();
// })

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

