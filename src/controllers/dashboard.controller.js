import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  if (!req.user?._id) throw new ApiError(404, "Unauthorized request");
  const userId = req.user?._id;

  const channelStats = await Video.aggregate([
    {
      $match: {
        owner: userId,
      },
    },
    {
      $lookup: {
        from: "Subscription",
        localField: "owner",
        foreignField: "channel",
        as: "Subscribers",
      },
    },
    {
      $lookup: {
        from: "Subscription",
        localField: "owner",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $lookup: {
        from: "Like",
        localField: "_id",
        foreignField: "video",
        as: "likedVideo",
      },
    },
    {
      $lookup: {
        from: "Comment",
        localField: "_id",
        foreignField: "video",
        as: "videoCommented",
      },
    },
    {
      $lookup: {
        from: "Tweet",
        localField: "_id",
        foreignField: "video",
        as: "tweets",
      },
    },
    {
      $group: {
        _id: null,
        totalVideos: { $sum: 1 },
        totalViews: { $sum: "$views" },
        subscribers: { $first: "$subscribers" },
        subscribedTo: { $first: "$subscribedTo" },
        totalLikes: { $sum: { $size: "$likedVideos" } },
        totalComments: { $sum: { $size: "$videoComments" } },
        totalTweets: { $first: { $size: "$tweets" } },
      },
    },
    {
      $project: {
        _id: 0,
        totalVideos: 1,
        totalViews: 1,
        subscribers: { $size: "$subscribers" },
        subscribedTo: { $size: "$subscribedTo" },
        totalLikes: 1,
        totalComments: 1,
        totalTweets: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channelStats,
        "All channel data fatched succesfully..!"
      )
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  if (!req.user?._id) throw new ApiError(404, "Unauthorized request");

  const videos = await Video.find({
    owner: req.user._id,
  });

  if (!videos[0]) {
    return res.status(200).json(new ApiResponse(200, [], "No videos found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Total videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };

