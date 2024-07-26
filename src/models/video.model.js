import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    videoFile:{
        type:String,//cloudinary url
        required: true,
    },
    thumbnail:{
        type:String,
        required: true,
    },
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    duration:{
        type:String, //cloudinary 
        // when we upload video in cloudinary we can get the duration
        required:true,
    },
    views:{
        type:Number,
        default:0,
    },
    isPublished:{
        type:Boolean,
        default:true,
    },
    videoUploader:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"

    }
},{
    timestamps:true, 
})

export const Video = mongoose.model('Video',videoSchema)


/*
workflow -->
user upload file   ----->  store this file in our local disk storage(multer)   
--->  from local we upload the file in cloudinary ---> local storage file delete 




*/