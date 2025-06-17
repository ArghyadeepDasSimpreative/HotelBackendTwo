import Booking from "../models/booking.model.js";
import mongoose from "mongoose";

export const getCustomersOfPropertyOwner = async (req, res, next) => {
  try {
    const ownerId = req.user._id;

    const customers = await Booking.aggregate([
      {
        $lookup: {
          from: "rooms",
          localField: "roomId",
          foreignField: "_id",
          as: "room",
        },
      },
      { $unwind: "$room" },
      {
        $lookup: {
          from: "properties",
          localField: "room.propertyId",
          foreignField: "_id",
          as: "property",
        },
      },
      { $unwind: "$property" },
      {
        $match: {
          "property.owner": new mongoose.Types.ObjectId(ownerId),
        },
      },
      {
        $group: {
          _id: "$userId",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          userId: "$user._id",
          firstname: "$user.firstname",
          lastname: "$user.lastname",
          email: "$user.email",
          phoneNumber: "$user.phoneNumber",
        },
      },
    ]);

    res.status(200).json(
        {
            success: true,
            customers
        }
       );
  } catch (err) {
    next(err);
  }
};
