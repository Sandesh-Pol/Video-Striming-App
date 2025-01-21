import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  //TODO: create playlist
  if (!name || !description) {
    throw new ApiError(400, "Please privode required filds..!");
  }

  const playlist = await Playlist.create(name, description, {
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, playlist, "Playlist created succesfully...!"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  if (!isValidObjectId(userId)) {
    new ApiError(400, "Invalid PlayList Id..!");
  }

  const userPlaylist = await Playlist.find({ owner: req.user._id });

  return res
    .status(200)
    .json(
      new ApiResponse(200, userPlaylist, "PlayList fatched succesfully...1")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!isValidObjectId(playlistId)) {
    new ApiError(400, "Invalid Playlist Id..!");
  }

  const playlist = await Playlist.findById(playlistId);

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fatched succesfully..!"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId)) {
    new ApiError(400, "Invalid Playlist Id..!");
  }
  if (!isValidObjectId(videoId)) {
    new ApiError(400, "Invalid Video Id..!");
  }
  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $push: {
        videos: videoId,
      },
    },
    {
      new: true,
      useFindAndModify: false,
    }
  );

  if (!playlist) {
    throw new ApiResponse(404, "playlist not found..!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Video added in playlist ..!"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from
  if (!isValidObjectId(playlistId)) {
    new ApiError(400, "Invalid Playlist Id..!");
  }
  if (!isValidObjectId(videoId)) {
    new ApiError(400, "Invalid video Id..!");
  }

  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    { $pull: { videos: videoId } },
    { new: true }
  );

  if (!playlist) {
    new ApiError(404, "Playlist not found..!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        playlist,
        "Playlist Updated succesfully after deletion..!"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!isValidObjectId(playlistId)) {
    new ApiError(400, "Invalid playlist ..!");
  }
  await Playlist.findByIdAndDelete({ _id: playlistId });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist deleted succesfully..!"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: update playlist
  const updatePlaylist = {
    name: req.body.name,
    description: req.body.description,
  };

  const updatePlaylistDetails = await Playlist.findByIdAndUpdate(
    playlistId,
    updatePlaylist,
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatePlaylistDetails,
        "Playlist Details Updated Successfully"
      )
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
