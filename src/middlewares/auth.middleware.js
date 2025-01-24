import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"; // Corrected import statement
import { User } from "../models/user.model.js";
export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // Extract token from cookies or authorization header
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    // Check if the token exists
    if (!token) {
      throw new ApiError(401, "Unauthorized!");
    }

    // Verify the token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Find the user by ID from the decoded token
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

    // If the user is not found, throw an error
    if (!user) {
      throw new ApiError(401, "Invalid access token!");
    }

    // Attach the user to the request object
    req.user = user;
    next();
  } catch (error) {
    // Handle token errors
    throw new ApiError(401, error.message || "Invalid access token!");
  }
});
