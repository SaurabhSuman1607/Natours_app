const Mongoose= require('mongoose');
const crypto = require('crypto');
const validator=require('validator'); 
const bcrypt = require('bcryptjs');
const userSchema =new Mongoose.Schema({
name:{
    type:String,
    required:[true , 'Hey tell us the name']
},
email:{
    type:String,
    required:[true, 'Give us your Email'],
    unique:true,
    lowercase:true,
    validate:[validator.isEmail,'Please give valid email']
},
photo:{
    type:String
},
role: {
    type:String ,
    enum: ['user' , 'guide' , 'lead-guide' , 'admin'],
    default:'user'
},
password:{
    type:String,
    required:[true, 'Give your password'],
      minlength:8,
      select : false
},
passwordConfirm:{
    type:String,
    required:[true, 'Give your password again it should be same'],
    validate: {
        //This will only work on the create and save !!!
        validator: function(el){
             return el === this.password;
        },
        message:'Password should be same'
    }
},
passwordChangedAt:{
    type: Date
},
passwordResetToken: String,
passwordResetExpires: Date,
active:{
    type:Boolean,
    default:true,
    select:false
} 
})

userSchema.pre(/^find/ ,function(next) {
  this.find({active : {$ne : false}});
next();
})
//middleware
userSchema.pre('save' ,async function(next){
    //Only run this function if password is modified
    if(!this.isModified('password')) return next();
  
   //pass the password with cost of 12
   this.password =await bcrypt.hash(this.password , 12);
   this.passwordConfirm=undefined;
   next();
})

userSchema.pre('save' , async function(next){

    if(!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt=Date.now() - 1000;
    next();
    })
userSchema.methods.confirmPasswords =  async function(candidatePassword , userPassword){
   return await bcrypt.compare(candidatePassword,userPassword); 
}
 
userSchema.methods.changedPasswordAfter = function (JWTTimestamp){
    if(this.passwordChangedAt){
        const changeTimeStamp= parseInt(this.passwordChangedAt.getTime() / 1000 , 10);
        return changeTimeStamp > JWTTimestamp;
    }
    //False Means that password is not changed 
    return false;
}

userSchema.methods.createPasswordResetTokens = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
 this.passwordResetToken=   crypto.createHash('sha256').update(resetToken).digest('hex');
 
 console.log( {resetToken} , this.passwordResetToken);
 this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
}
const User = Mongoose.model('User_UPD', userSchema);
module.exports=User;