
const AppError= require('../utils/AppError');
const apiFeatures=require('../utils/apiFeatures');

const catchAsync = fn =>{
  return (req,res,next) => {
     fn(req, res , next).catch(next);
  };
};


exports.deleteOne = Model => 
    catchAsync(async (req,res,next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
  
     if(!doc){
        return next(new AppError('No document found with this ID' , 404));
     }
     res.status(204).json({
        status:'success',
        data:null
     });

   next();
   });

   exports.updateOne = Model =>catchAsync(async (req, res , next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if(!document){
      return next(new AppError('No document found in the ID' , 404));
     }

    res.status(200).json({
      status: 'Successfull',
      data: {
        data:document
      },
    })
});

exports.createOne = Model => catchAsync(async (req, res , next) => {
 
    /* res.send('Done'); */
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data:doc
      }
    });
  
});

exports.getOne = (Model , pop) => catchAsync(async (req,res,next) => {
  let query = Model.findById(req.params.id);
  if(pop) query=query.populate(pop);
  const doc =await query;

  if(!doc){
    return next( new AppError('No documents with this Id can be found', 404));
  }

  res.status(200).json({
    status:'success',
    data: {
      data:doc
    }
  })
})

exports.getAll= Model =>  catchAsync(async (req, res , next) => {
   let filter = {};
    if(req.params.tourId) filter = { tour : req.params.tourId};
    const features = new apiFeatures(Model.find(), req.query).filter().sort().limiting().pagination();
    const doc = await features.query;

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        doc,
      }
    });
});