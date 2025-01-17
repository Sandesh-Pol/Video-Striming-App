import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const like = await Like.findOne({ video: videoId, likedBy: req.user._id });

  if (like) {
    await Like.deleteOne({ video: videoId, likedBy: req.user._id });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Like removed successfully"));
  }

  const likedVideo = await Like.create({
    video: videoId,
    likedBy: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, likedVideo, "Like added successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const like = await Like.findOne({
    commemt: commentId,
    likedBy: req.user._id,
  });

  if (like) {
    await like.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Like Removed Successfully"));
  }

  const likedComment = await Like.create({
    comment: commentId,
    likedBy: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(200, likedComment, "Comment Added Successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  const like = await Like.findOne({ tweet: tweetId, likedBy: req.user._id });

  if (like) {
    await like.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Like Removed Successfully"));
  }

  const likedTweet = await Like.create({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(200, likedTweet, "Tweet Added Successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
    try {
      const likes = await Like.find({ likedBy: req.user?._id, video: { $ne: null } })
        .populate("video");
  
      const likedVideos = likes.map(like => like.video);
  
      if (likedVideos.length === 0) {
        return res
          .status(200)
          .json(new ApiResponse(200, [], "You haven't liked any videos yet"));
      }
  
      return res
        .status(200)
        .json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"));
    } catch (error) {
      throw new ApiError(500, "Failed to fetch liked videos");
    }
  });
  

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
