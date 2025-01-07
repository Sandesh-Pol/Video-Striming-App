import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const generateAccessAndRefreashTcken = async (userID) => {
  try {
    const user = await User.findById(userID);
    const accessToken = user.generateAccessToken();
    const refreashToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBefourSave: false });

    return { accessToken, refreashToken };
  } catch (error) {
    throw new ApiError(500, "Something wrong to genarate tocken...!");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required..!");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required..!");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

  if (!avatar) {
    throw new ApiError(500, "Failed to upload avatar to cloud storage");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(
      500,
      "Something went wrong while registering the user..!"
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully..!"));
});

const loginuser = asyncHandler(async (req, res) => {
  const { eamil, username, password } = req.body;

  if (!username || !eamil) {
    throw new ApiError(400, "Email and username are required..!");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User not found..!");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    401, "invalid password";
  }

  const { accessToken, refreashToken } = await generateAccessAndRefreashTcken(
    user._id
  );

  const loggedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const option = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refershToken", refreashToken, option)
    .json(
      200,
      {
        user: loggedUser,
        accessToken,
        refreashToken,
      },
      "User logid in sccessfully ...!"
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:
      {
        refershToken:undefined
      }
    },
    {
      new:true
    }
  )
  const option = {
    httpOnly: true,
    secure: true,
  };
  return res
  .status(200)
  .clearCookie("accessToken",option)
  .clearCookie("refreashToken",option)
  .json(new ApiResponse(200,{},"user logged succesfully...!"))
});

export { registerUser, loginuser, logoutUser };
