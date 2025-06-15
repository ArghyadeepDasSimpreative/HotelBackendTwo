import Property from "../models/property.model.js";

export const verifyPropertyOwnership = async (req, res, next) => {
  try {
    console.log(req.user)
    const { propertyId } = req.params;

    if (!propertyId) {
      return res.status(400).json({ success: false, message: "Property ID is required" });
    }

    const property = await Property.findOne({ _id: propertyId, ownerId: req.user._id });

    if (!property) {
      return res.status(403).json({ success: false, message: "Unauthorized or property not found" });
    }

    // Optional: Attach property to request for further use
    req.property = property;
    next();
  } catch (err) {
    next(err);
  }
};
