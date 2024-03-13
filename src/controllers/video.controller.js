import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";
import Jwt from "jsonwebtoken";
import { uploadOnCloudinary } from "../utils/cloudinary.service.js";


const uploadVideo = asyncHandler(async (req, res) => {
  const uploadVideolocalpath = req.file.path;
  console.log("uploadVideolocalpath ::",req.file.path);

  if(!uploadVideolocalpath){
    res.status(400)
    throw new ApiError(400,"No file uploaded")
  }

  const videoURL = await uploadOnCloudinary(uploadVideolocalpath);
  console.log("videoURL ::::",videoURL);

  const UploadedVideo = await Video.create({
    videoFile: videoURL.url,
    duration: videoURL.duration
  });

  if(!UploadedVideo){
    res.status(400)
    throw new ApiError(400, "Video not uploaded")
  }

  return res.status(201).json(
    new ApiResponse(201, UploadedVideo, "Video uploaded successfully")
)

  })


export {
 uploadVideo
}