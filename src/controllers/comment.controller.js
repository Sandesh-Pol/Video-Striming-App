import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  if (!isValidObjectId(videoId)) {
    throw new ApiError("Invalid video id...!");
  }

  const skip = (page - 1) * limit;
  const commemt = await Comment.find({ video: videoId })
    .skip(skip)
    .limit(limit);

  return res
    .status(200)
    .json(new ApiResponse(200, commemt, "Comments fatch succesfully..!"));
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { content } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const comment = await Comment.create({
    video: videoId,
    content,
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(200, comment, "Comment Published Successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { content } = req.body;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  const updateCommentContent = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content: content,
      },
    },
    { new: true }
  );

  if (!updateCommentContent) {
    throw new ApiError(400, "comment not found or invalid comment id");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updateCommentContent, "Comment Updated Successfully")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const deleteComment = Comment.findByIdAndDelete({ _id: commentId });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment Deleted Successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
