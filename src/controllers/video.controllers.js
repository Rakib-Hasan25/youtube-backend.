import { asyncHandler } from "../utils/AsyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { Video } from "../models/video.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {v2 as cloudinary} from 'cloudinary'





const publishAVideo =asyncHandler( async(req,res)=>{
    /*
    1.first user have to authorized to publish a video
    2) videos details extract 
    3) videos --->local storage ---> cloudinary --->url
    */
    
    const {title,description}=req.body
    

    console.log(title,description)
    if(
        [title,description].some((field)=>field?.toLowerCase()==="")
    ){
        throw new ApiError(400,"title and description needed")
    }
    
    
    const videoLocalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path
    
    // console.log(videoLocalPath)
    
    
    if(!videoLocalPath) {
        throw new ApiError(400,"video file is required")
    }
    
    if(!thumbnailLocalPath) {
        throw new ApiError(400,"thumbnail is required")
    }
    
    
    const uploadedVideo= await uploadOnCloudinary(videoLocalPath)
    const uploadedThumbnail= await uploadOnCloudinary(thumbnailLocalPath)
    
    console.log(uploadedVideo)
    if(!uploadedVideo) {
        throw new ApiError(400,"upload video failure")
    }
    
    if(!uploadedThumbnail) {
        throw new ApiError(400,"upload thumbnail failure ")
    }
    
    const video = await Video.create({
        videoFile: uploadedVideo?.url||"" ,
        thumbnail: uploadedThumbnail?.url||"",
        title:title,
        description:description,
        duration:uploadedVideo?.duration||"",
        videoUploader:req.user._id
    })
    
    
    const publishVideo = await Video.findById(video._id)
    
    if(!publishVideo){
        throw new ApiError(500,"something went wrong while saving video")
    }
    
    return res
    .status(201)
    .json(
        new ApiResponse(201,publishVideo,"video uploaded successfully")
    )
    })

    
const getVideoById = asyncHandler(
    async(req, res) => {
            const {videoId} = req.params

            if(!videoId.trim()){
                throw new ApiError(404,"video id is missing")
            }
            const video = await Video.findById(
                videoId
            )

            if(!video){
                throw new ApiError(400,"something went wrong while getting video from db")
            }
            return res.status(200).json(new ApiResponse(200,video,"video successfully fetched"))



    }
)


const updateVideo = asyncHandler(
    async(req,res)=>{
        const {videoId} = req.params
        const {title,description}=req.body
        const thumbnailLocalPath = req.file.path

        if(!title || !description |!thumbnailLocalPath){
            throw new ApiError(400,"All fields are required")
        }
        if(!videoId ){
            throw new ApiError(404,"video Id is missing")
        }


        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)


        if(!thumbnail ){
            throw new ApiError(404,"something went wrong while uploading thumbnail")
        }
        
        
        const video = await Video.findById(
            videoId
        )
       

        if(!video){
            throw new ApiError(400,"video is not found")

        }


        const response = await cloudinary.uploader.destroy(video.thumbnail)


        if(response){
            console.log("old thumbnail deleted successfully")

        }
        

       const updatedVideo= await Video.findByIdAndUpdate(
            videoId,{
                $set:{
                    title,
                    description,
                    thumbnail:thumbnail.url
                }

        },
        {
            new:true
        }
    
    )

    if(!updatedVideo){

        throw new ApiError(500,"something went wrong while updating")
    }

    return res
    .status(200).json(
        new ApiResponse(200,updateVideo,"Video details updated successfully"
    )
)


    }
)
const deleteVideo = asyncHandler(
    async(req,res)=>{

        const {videoId}=req.params

        if(!videoId.trim()){
            throw new ApiError(404,"video id is missing")
        }

        const video = await Video.findById(videoId)

        if(!video){
            throw new ApiError(400, "video not found in db")
        }


        const response = await cloudinary.uploader.destroy(video.thumbnail,video.videoFile)

            if(response){
                console.log("thumbnail and video file deleted from cloudinary successfully")
            }


           const rmVideo= await Video.findByIdAndDelete(videoId)

           if(!rmVideo){
            throw new ApiError(500,"something went wrong while deleting video")
           }

           return res
           .status(200)
           .json(
            new ApiResponse(200,[],"video file deleted successfully")
           )


    }
)

const togglePublishStatus =  asyncHandler(
    async(req,res)=>{

        const {videoId}=req.params

        if(!videoId.trim()){
            throw new ApiError(404,"video id is missing")
        }

        const video = await Video.findById(videoId)

        if(!video){
            throw new ApiError(400, "video not found in db")
        }


        const status = video.isPublished


        console.log(status)


        const updatedVideo=await Video.findByIdAndUpdate(
            videoId,{
                $set:{
                    isPublished: status===true?false:true
                }
            },
            {
                new:true
            }
        ).select('-description -duration -views')



        if(!updateVideo){
            throw new ApiError(500,"something went wrong while updating the publishedstatus")
        }


        return res
        .status(200)
        .json(
         new ApiResponse(200,updatedVideo,"changed publishedStatus successfully")
        )
    }
)
    


    export {publishAVideo,getVideoById,updateVideo,deleteVideo,togglePublishStatus}