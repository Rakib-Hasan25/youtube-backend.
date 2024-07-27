import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
const userSchema =new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim : true, 
    },
    fullName:{
        type: String,
        required: true,
        trim : true,
        index:true  
    },
    avatar:{
        type:String,//cloudinary url
        required:true,
    },
    coverImage:{
        type:String,//cloudinary url
    },
    watchHistory:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }

    ],
    password:{
        type:String,
        required:[true,"password is required"]
    },
    refreshToken:{
        type:String
    }
},{
   timestamps:true 
})

userSchema.pre("save",async function(next){
    console.log("password1")
    if(!this.isModified("password")) return next()
  
  this.password= await bcrypt.hash(this.password, 10)

  next()

})

userSchema.methods.isPasswordCorrect = async function (password){
   const variable= await bcrypt.compare(password,this.password);
   console.log(variable,this.password)
   return variable
}




userSchema.methods.generateAccessToken =function(){
    return jwt.sign(
        {
            //payload:
            _id:this._id,
            email:this.email,
            username:this.username,
            fullName:this.fullName,
        },
        //access token secret
        process.env.ACCESS_TOKEN_SECRET
        
        ,
        {
           expiresIn: process.env.ACCESS_TOKEN_EXPIRY
            //expiry 
        }
    )
}


userSchema.methods.generateRefreshToken =function(){
    return jwt.sign(
        {
            //payload:
            _id:this._id,
           
        },
        //access token secret
        process.env.REFRESH_TOKEN_SECRET
        
        ,
        {
           expiresIn: process.env.REFRESH_TOKEN_EXPIRY
            //expiry 
        }
    )
}






export const User = mongoose.model('User',userSchema)
