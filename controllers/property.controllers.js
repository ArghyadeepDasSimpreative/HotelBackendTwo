import Property from '../models/property.model.js';
import Amenity from '../models/amenity.model.js';
import { Feature } from '../models/feature.model.js';
import { City } from '../models/city.model.js';

export const createProperty = async (req, res, next) => {
  try {
    const {
      name,
      description,
      type,
      cityId,
      address,
      latitude,
      longitude,
      featureIds = [],
      amenityIds = []
    } = req.body;

    console.log("req.files is ", req.files)

    if (!name || !description || !type || !cityId || !address || !latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }

    const cityExists = await City.findById(cityId);
    if (!cityExists) return res.status(400).json({ success: false, message: 'Invalid city ID' });

    const invalidAmenityIds = await Promise.all(
      amenityIds.map(async (id) => (await Amenity.exists({ _id: id }) ? null : id))
    );
    const filteredAmenityIds = invalidAmenityIds.filter(Boolean);
    if (filteredAmenityIds.length > 0) {
      return res.status(400).json({ success: false, message: 'Invalid amenity IDs', ids: filteredAmenityIds });
    }

    const featureDocs = await Promise.all(
      featureIds.map((id) => Feature.findById(id))
    );
    
    const filteredFeatureDocs = featureDocs.map(item => item._id.toString())

    const imageUrls = req.files?.map((file) => file.filename) || [];

    const property = new Property({
      name,
      description,
      type,
      cityId,
      address,
      latitude,
      longitude,
      features: filteredFeatureDocs,
      amenityIds,
      images: imageUrls,
      ownerId: req.user._id
    });

    const saved = await property.save();

    res.status(201).json({ success: true, property: saved });
  } catch (err) {
    console.log(err);
    next(err);
  }
};
