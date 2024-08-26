class apiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  /*   Build the query
        const queryObj = { ...req.query };
        const excluding = ['page', 'sort', 'limit', 'fields'];
        excluding.forEach(el => delete queryObj[el]);
        console.log(queryObj);
  
         We can't do the await on the req.query object because if we dp that we can't do the pagination
         and sorting later in that so that why we take an hardcopy of object and we are first soing our paging 
          and all then we will do the await
          console.log(req.query,queryObj);
          const tours = await Tour.find({
           duration:5,
           difficulty:'easy'
          });
         const tours = await Tour.find()
           .where('duration')
           .equals(5)
           .where('difficulty')
        .equals('easy'); 
     
           what we did here basically we use greater then equal to lesser then equal(gte,lte) and added
     mongoose $ to make it suitable and then for that first changed in string then replaced it then
      later created an object to use this as a filter
           Advance filtering
     
           let queryStr = JSON.stringify(queryObj);
           queryStr = queryStr.replace(/\b(gte|lt|lte|gt)\b/g, match => `$${match}`);
           console.log(JSON.parse(queryStr));
           let query = Tour.find(JSON.parse(queryStr));
     
           console.log(req.query.sort);
            Sorting
           if (req.query.sort) {
             const sortby = req.query.sort.split(',').join(' ');
             console.log(sortby);
             query = query.sort(sortby);
           }
            else {
             query = query.sort('-createdAt');
           }
     
            Limiting
           if (req.query.fields) {
               we make the fields in [ name  difficulty  price  duration ] in this format
             const limitby = req.query.fields.split(',').join(' ');
             query = query.select(limitby);
           }
            else {
             query = query.select(-__v);
           }
     
           const tours = await query;
     
           const queryObj = { ...req.query };
           const excluding = ['page', 'sort', 'limit', 'fields'];
           excluding.forEach(el => delete queryObj[el]);
     
     
           let queryStr = JSON.stringify(queryObj);
           queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
     
           let query = Tour.find(JSON.parse(queryStr));
     
            Sorting  
           if (req.query.sort) {
             const sortBy = req.query.sort.split(',').join(' ');
             query = query.sort(sortBy);
           } else {
             query = query.sort('-createdAt');
           }
     
            Field Limiting
           if (req.query.fields) {
             const fields = req.query.fields.split(',').join(' ');
             query = query.select(fields);
           }
           else {
             query = query.select('-__v');
           }
     
            Pagination
           const page = req.query.page * 1 || 1;
           const limit = req.query.limit * 1 || 10;
           const skip = (page - 1) * limit;
           query = query.skip(skip).limit(limit);
           if (req.query.page) {
             const numTours = await Tour.countDocuments();
             if (skip >= numTours) throw new Error('This page does not exist');
           }*/

  filter() {
    const queryObj = { ...this.queryString };
    const excluding = ['page', 'sort', 'limit', 'fields'];
    excluding.forEach(el => delete queryObj[el]);


    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;

  }

  limiting() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    }
    else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

}

module.exports=apiFeatures;