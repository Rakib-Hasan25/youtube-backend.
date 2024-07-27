import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import {ApiError } from "../utils/ApiError.js"
import jwt from "jsonwebtoken";
export const verifyJWT = asyncHandler(async (req, res, next) => {

    console.log(req.cookies?.access_token)
  const token =
    req.cookies?.access_token||
    req.header("Authorization").replace("Bearer ", "");
    console.log(token)
  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  //decodedToken ---> _id,username,fullName,email

  console.log(decodedToken);
  const user = await User.findById(decodedToken?._id).select(
    "-password -refreshToken"
  );
  console.log(user)

  if (!user) {
    throw new ApiError(401, "Invalid access token");
  }

  req.user = user;
  //we add a rew object in the req
  next()

});
