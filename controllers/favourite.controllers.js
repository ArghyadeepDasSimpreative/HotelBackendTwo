import Favorite from "../models/favourite.model.js";

export const toggleFavorite = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { roomId } = req.params;

    if (!roomId) {
      return res.status(400).json({ success: false, message: "roomId is required" });
    }

    const existing = await Favorite.findOne({ userId, roomId });

    if (existing) {
      await Favorite.deleteOne({ _id: existing._id });
      return res.status(200).json({
        success: true,
        message: "Removed from favorites",
        isFavorited: false,
      });
    } else {
      await Favorite.create({ userId, roomId });
      return res.status(201).json({
        success: true,
        message: "Added to favorites",
        isFavorited: true,
      });
    }
  } catch (err) {
    next(err);
  }
};

