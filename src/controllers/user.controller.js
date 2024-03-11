import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { UserModel } from "../models/user.model.js";


const generateAccessAndRefreshTokens = async (userId) =>{
  try {
      const user = await UserModel.findById(userId);
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken();

      user.refreshToken = refreshToken;
      await user.save({validateBeforeSave: false});

      return {
        accessToken,refreshToken
      }

  } catch (error) {
     throw new ApiError(500, "Something went wrong while generating refresh and access token")
  }
}

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
    username?.trim().length,
    email,
    fullName,
    password
  );

  if ([username, email, fullName, password].some((field) => !field)) {
    throw new ApiError(400, "All Fields are required!");
  }
  if (username.trim().length < 3) {
    throw new ApiError(400, "Username field are wrong");
  }
  if (password.trim().length < 6) {
    throw new ApiError(400, "Password field are wrong");
  }
  if (fullName.trim().length < 3) {
    throw new ApiError(400, "fullName field are wrong");
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
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

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

const loginUser = asyncHandler(async(req,res) => {
  //data from request body
  //username or email
  //find the user
  //check the password
  //access and refresh token
  //send cookie

  const {email,username,password} = req.body;

  if(!(username || email)){
    throw new ApiError(400,"username of email required!")
  }

  const existUser = await UserModel.findOne({
    $or: [{ username }, { email }]
  });

  if(!existUser){
    throw new ApiError(404, "User does not exist")
  }

  const isPasswordValid = await existUser.isPasswordCorrect(password);

  if(!isPasswordValid){
    throw new ApiError(401, "Invalid user credentials");
  }


   const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(existUser._id);
 
    const loggedInUser = await UserModel.findById(existUser._id).select("-password -refreshToken")

    const options = {
      httpOnly: true,
      secure: true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
      new ApiResponse(
        200,
        {
            user: loggedInUser, accessToken, refreshToken
        },
        "User logged In Successfully"
        )
    )


})

const logoutUser = asyncHandler(async(req,res) => {
await UserModel.findByIdAndUpdate(
  req.user._id,
  {
    $set: {
      refreshToken: undefined
    }
  },
  {
    new : true
  }
);

const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(req.user._id);

const options = {
  httpOnly: true,
  secure: true
}

 return res
      .status(200)
      .cookie("accessToken",accessToken,options)
      .cookie("refreshToken",refreshToken,options)
      .json(new ApiResponse(200,{},"User logged Out"))

})

export { 
  registerUser,
  loginUser,
  logoutUser
 };
