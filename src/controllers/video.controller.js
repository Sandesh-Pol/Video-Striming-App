import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query = "",
    sortBy = "createdAt",
    sortType = 1,
    userId = "",
  } = req.query;

  try {
    const videoAggregate = await Video.aggregate([
      {
        $match: {
          $or: [
            {
              title: { $regex: query, $optios: "i" },
            },
            {
              description: { $regex: query, $optios: "i" },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "User",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [
            {
              $project: {
                _id: 1,
                fullname: 1,
                avatar: 1,
                username: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          owner: {
            $first: "$owner",
          },
        },
      },

      {
        $sort: {
          [sortBy || "createdAt"]: sortType || 1,
        },
      },
    ]);
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Internal server error in video aggregation"
    );
  }

  const options = {
    page,
    limit,
    customLabels: {
      totalDocs: "totalVideos",
      docs: "videos",
    },
    skip: (page - 1) * limit,
    limit: parseInt(limit),
  };
  Video.aggregatePaginate(videoAggregate, options)
    .then((result) => {
      if (result?.videos?.length === 0) {
        return res
          .status(200)
          .json(new ApiResponse(200, [], "No videos found"));
      }

      return res
        .status(200)
        .json(new ApiResponse(200, result, "video fetched successfully"));
    })
    .catch((error) => {
      throw new ApiError(
        500,
        error?.message || "Internal server error in video aggregate Paginate"
      );
    });
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
  if (!(title && description)) {
    throw new ApiError(400, "Please provide title and description..!");
  }

  const videoLocalPath = req?.files?.videoFile[0]?.path;

  const thumbnailLocalPath = req?.files?.thumbnail[0]?.path;

  if (!videoLocalPath && !thumbnailLocalPath) {
    throw new ApiError(400, "Plese provide the file..!");
  }

  const video = await uploadOnCloudinary(videoLocalPath);

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  const videoPublished = await Video.create({
    title,
    description,
    videoFile: {
      url: video.secure_url,
      public_id: video.public_id,
    },
    thumbnail: {
      url: thumbnail.secure_url,
      public_id: thumbnail.public_id,
    },
    duration: video.duration,
    owner: req.user._id,
  });
  return res
    .status(201)
    .json(new ApiResponse(200, videoPublished, "Video Published Successfully"));
});


const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
