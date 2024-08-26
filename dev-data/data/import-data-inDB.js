const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../Models/tourModel');
const Reviews=require('./../../Models/reviewModel');
const User=require('./../../Models/userModel');
const { argv } = require('process');

dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB connection are successful'));

// For reading the data and making it array of an object
const data = JSON.parse(
  fs.readFileSync(`${__dirname}/tours.json`, 'UTF-8'),
);
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'UTF-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'UTF-8'));

// For loading a data in the db
const importData = async () => {
  try {
    await Tour.create(data); // We can load the data in db through this and giving array of an object
    await User.create(users, {validateBeforeSave : false});
    await  Reviews.create(reviews);
    console.log('Data loaded Successfully');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// For deleting unecessary data first from the db
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Reviews.deleteMany();
    console.log('Deletion done successfully');    
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (argv[2] === '--import') {
  importData();
}  
else if (argv[2] === '--delete') {
  console.log("deletion starting");
  deleteData();
  
}
console.log(process.argv);
