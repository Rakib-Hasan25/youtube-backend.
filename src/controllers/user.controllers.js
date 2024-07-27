import { asyncHandler } from "../utils/AsyncHandler.js"
import {ApiError } from "../utils/ApiError.js"
// import mongoose from "mongoose"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const registerUser = asyncHandler(async(req,res)=>{

    /*
1) get user information from frontend
2)validate user information -->empty
3)check if user already exists in db 
4) check for images
5) upload them to cloudinary
6)check if images uploaded to cloudinary successfully
7)create user object -> create user entry in db (mongodb)
8)check for user creation
9) return a response 

    */
//1st step :
const {fullName,email,username,password} = req.body

console.log(fullName, email, username, password)
//2nd step 
if([fullName,email,username,password].some((field)=>field.trim()==="")){
    throw new ApiError(400,"all fields are required")
}



//3rd 
const existedUser = await User.findOne({
    $or:[
        {username},{email}
    ]
})

if(existedUser){
    throw new ApiError(405,"user already exists")
}


//4th step 

const avatarLocalPath= req.files?.avatar[0]?.path

console.log(req.files)
console.log(avatarLocalPath)


let coverImageLocalPath;
if(req.files && req.files.coverImage.length>0){
    coverImageLocalPath= req.files?.coverImage[0]?.path
}

if(!avatarLocalPath){
    throw new ApiError(400,"avatar not found")
}



const avatar =await uploadOnCloudinary(avatarLocalPath)
const coverImage= await uploadOnCloudinary(coverImageLocalPath)


if(!avatar){
    throw new ApiError(400,"avatar not found")
}


const user = await User.create({
    fullName:fullName,
    email,
    password,
    username: username.toLowerCase(),
    avatar:avatar.url,
    coverImage:coverImage?.url || ""
})


const createdUser = await User.findById(user._id)


if(!createdUser){
    throw new ApiError(500,"data not found, something went wrong")
}


return res.status(201).json(
   new ApiResponse(201,createdUser,"user Registered successfully") 
)
})




const loginUser = asyncHandler(
    async(req,res)=>{
/*
1) we have to extract the data from req 
2) check 
3) find the user 
4) password check 
5) generate access token and refresh token
6) refresh token save  db 
7) cookies __> refresh and access token save 
8) response  

*/


//1st

const {email, username, password} = req.body

console.log(email,username,password)
//2nd step
if( !username && !email){
    throw new ApiError(400, "username and email are required")
}



const user = await User.findOne({
    $or:[
        {email},{username}
    ]
})


//3rd step 
if(!user ){
    throw new ApiError(404,"user is not found")
}

//4th step
const isPasswordValid = await user.isPasswordCorrect(password) 

if(!isPasswordValid){
    throw new ApiError(401,"Invalid password")
}



//5th step 

 
const accessToken = await user.generateAccessToken()

const refreshToken = await user.generateRefreshToken()


user.refreshToken=refreshToken

await user.save({validateBeforeSave:false })

console.log(user.refreshToken)
const loggedInUser= await User.findById(user._id).select("-password -refreshToken") 

if(!loggedInUser){
    throw new ApiError(500,"something went wrong ")
}


 const options = {
    httpOnly:true,
    secure:true,
 }

return res
.status(200)
.cookie("access_token",accessToken,options)
.cookie("refresh_token",refreshToken,options)
.json(
    new ApiResponse(200,{
        user:loggedInUser,
        accessToken,
        refreshToken
    },
"user logged in successfully"
),

)
    }
)



const logoutUser= asyncHandler(async(req,res)=>{


    //1.find the user
    //2. update its refresh token value to undefined
    //3.cookies ---> refresh token and access token clear
    //4.send a response


    console.log(req.user._id)
   const user = await User.findByIdAndUpdate(
    req.user._id,{
        $unset:{
            refreshToken: 1 //  this remove refresh token value 
        }
    },{
        new:true
    }

   )


   const options={
    httpOnly:true,
    secure:true
   }

   return res
   .status(200)
   .clearCookie("access_token",options)
   .clearCookie("refresh_token",options)
   .json(
    new ApiResponse(200,{},"user logged out ")
   )

   
})



const refreshAccessToken =asyncHandler(
    async(req,res)=>{
        /*
        1) access token expire --> refresh token expire ?
        2) refreshtoken ----> access token 
        3
        */

        const incomingRefreshToken =req.cookies.refresh_token


        if(!incomingRefreshToken){
            throw new ApiError(401,"unauthorized request")
        }


        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)


        const user = await User.findById(decodedToken?._id)

        if(!user){
            throw new ApiError(401,"Invalid refresh token")
        }


        if(incomingRefreshToken!= user.refreshToken){
            throw new ApiError(401,"Refresh Token is expire")
        }



         
const accessToken = await user.generateAccessToken()

const refreshToken = await user.generateRefreshToken()


user.refreshToken=refreshToken
await user.save({validateBeforeSave:false })

const options={
    httpOnly:true,
    secure:true
   }
return res
.status(200)
.cookie("access_token",accessToken,options)
.cookie("refresh_token",refreshToken,options)
.json(
    new ApiResponse(
        200,{
        accessToken:accessToken,
        refreshToken:refreshToken,},
        "access token updated "
    )
)

    }
)


const changeCurrentPassword = asyncHandler(
    async(req,res)=>{
        const {oldPassword,newPassword,confirmPassword} =req.body

        if(newPassword != confirmPassword){
            throw new ApiError(401,"confirmPassword isn't match with newpassword")
        }


        const user = await User.findById(req.user._id)

        const isPasswordCorrect= await user.isPasswordCorrect(oldPassword)

        if(!isPasswordCorrect){
            throw new ApiError(401,"Invalid old Password")
        }

        user.password = newPassword
        await user.save({validateBeforeSave:false })


        return res
        .status(200)
        .json(
            new ApiResponse(200,{},"password updated successfully")
        )


    }
)


const getCurrentUser = asyncHandler(
    async(req,res)=>{
        return res
        .status(200)
        .json(
            new ApiResponse(200,req.user,"current user fetched")
        )
    }
)



const updateAccoutDetails = asyncHandler(
    async(req,res)=>{
          const{fullName,email}= req.body

          if(!fullName && !email){
            throw new ApiError(400, "All fields are required")
          }


         const user =  await User.findByIdAndUpdate(
            req.user._id,
            {
                $set:{
                    fullName:fullName,
                    email:email
                }
            },{
                new:true
            }
          ).select("-password -refreshToken ")

          if(!user){
            throw new ApiError(500,"something went wrong in server") 
          }

          return res
          .status(200)
          .json(
            new ApiResponse(200, user, "Account details updated successfully")
          )


    }
)

const updateUserAvatar = asyncHandler(
    async(req,res)=>{
       const avatarLocalPath = req.file?.path


       console.log(avatarLocalPath)
       if(!avatarLocalPath){
        throw new ApiError(404,"avatar file is not send")
       }

       const avatar = await uploadOnCloudinary(avatarLocalPath)
       console.log(avatar)
       if(!avatar.url){
        throw new ApiError(500,"Error while uploading avatar on cloudinary")
       }


       const user =  await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
              avatar:avatar.url
            }
        },{
            new:true
        }
      ).select("-password -refreshToken ")

      if(!user){
        throw new ApiError(500,"something went wrong in server") 
      }

      return res
      .status(200)
      .json(
        new ApiResponse(200, user, "avatar file updated successfully")
      )

    }   
)


const updateUserCoverImage = asyncHandler(
    async(req,res)=>{


        const coverImageLocalPath = req.file?.path

       if(!coverImageLocalPath){
        throw new ApiError(404,"avatar file is not send")
       }

       const coverImage = await uploadOnCloudinary(coverImageLocalPath)

       if(!coverImage.url){
        throw new ApiError(500,"Error while uploading coverImage on cloudinary")
       }


       const user =  await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
              coverImage:coverImage.url
            }
        },{
            new:true
        }
      ).select("-password -refreshToken ")

      if(!user){
        throw new ApiError(500,"something went wrong in server") 
      }

      return res
      .status(200)
      .json(
        new ApiResponse(200, user, "coverImage file updated successfully")
      )

       
    }
)

export {registerUser,loginUser,logoutUser,refreshAccessToken,
    changeCurrentPassword,getCurrentUser,updateAccoutDetails,
    updateUserAvatar,updateUserCoverImage}