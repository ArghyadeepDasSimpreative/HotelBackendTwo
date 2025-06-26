import Amenity from "../models/amenity.model.js"
import { errorHandler } from "../utils/error.js"

export const addAmenity = async (req, res) => {
  try {
    const { name, description } = req.body
    const image = req.file?.filename

    if (!name || !description || !image) {
      return res.status(400).json({ success: false, message: "All fields are required" })
    }

    const amenity = await Amenity.create({ name, description, image })

    res.status(201).json({ success: true, amenity })
  } catch (error) {
    errorHandler(error, req, res);
  }
}

//

export const getAllAmenities = async (req, res, next) => {
  try {
    const amenities = await Amenity.find()
    res.status(200).json({ success: true, amenities })
  } catch (err) {
    next(err)
  }
}

export const getAmenityById = async (req, res, next) => {
  try {
    const amenity = await Amenity.findById(req.params.id)
    if (!amenity) return res.status(404).json({ success: false, message: "Amenity not found" })
    res.status(200).json({ success: true, amenity })
  } catch (err) {
    next(err)
  }
}

export const updateAmenity = async (req, res, next) => {
  try {
    const updateData = {
      name: req.body.name,
      description: req.body.description
    }

    if (req.file && req.file.cloudinary) {
      updateData.image = req.file.cloudinary.url
    }

    const amenity = await Amenity.findByIdAndUpdate(req.params.id, updateData, { new: true })

    if (!amenity) return res.status(404).json({ success: false, message: "Amenity not found" })
    res.status(200).json({ success: true, amenity })
  } catch (err) {
    next(err)
  }
}

export const deleteAmenity = async (req, res, next) => {
  try {
    const amenity = await Amenity.findByIdAndDelete(req.params.id)
    if (!amenity) return res.status(404).json({ success: false, message: "Amenity not found" })
    res.status(200).json({ success: true, message: "Amenity deleted" })
  } catch (err) {
    next(err)
  }
}









