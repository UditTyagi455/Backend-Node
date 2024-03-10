import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { UserModel } from "../models/user.model.js";

const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  //validation -not Empty
  //check if user already exists : username,email
  //check for image, check for avatar
  //upload them to cloudinary,avtar
  //create user object -create entry in db
  //remove password and refresh token field from response
  //check for user creation
  //return res

  const { username, email, fullName, password } = req.body;
  console.log(
    "request-body content ====>",
    username,
    email,
    fullName,
    password
  );

  if (
    [username, email, fullName, password].some(
      (field) => !!field?.trim() == false
    )
  ) {
    throw new ApiError(400, "All Fields are required!");
  }
  if (!email?.includes("@")) {
    throw new ApiError(400, "Email Address Not Valid!");
  }

  const existedUser = await UserModel.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exist");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(409, "Avtar file is required!");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(409, "Avtar file is required!");
  }

  const User = await UserModel.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await UserModel.findById(User._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

export { registerUser };
