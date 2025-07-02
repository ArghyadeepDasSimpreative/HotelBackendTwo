import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, required: true }, // e.g., Hotel, Resort
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cityId: { type: mongoose.Schema.Types.ObjectId, ref: "City", required: true },
    address: { type: String, required: true },
    pincode: { type: String },
    
    // Replacing latitude & longitude with GeoJSON location
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },

    features: [{ type: mongoose.Schema.Types.ObjectId, ref: "Feature" }],
    images: [String],
    thumbnail: { type: String },
    isActive: { type: Boolean, default: true },
    totalRooms: { type: Number },
    policies: { type: String },
  },
  { timestamps: true }
);

// 2dsphere index for geospatial queries
propertySchema.index({ location: "2dsphere" });

const Property = mongoose.model("Property", propertySchema);

export default Property;
