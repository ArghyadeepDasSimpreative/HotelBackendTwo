import { City } from "../models/city.model.js"

export const createCity = async (req, res, next) => {
  try {
    const { name, description } = req.body
    const city = await City.create({ name, description })
    res.status(201).json({ success: true, data: city })
  } catch (err) {
    next(err)
  }
}

export const getAllCities = async (req, res, next) => {
  try {
    const cities = await City.find().select('_id name description image').sort({ createdAt: -1 })
    res.status(200).json({ success: true, data: cities })
  } catch (err) {
    next(err)
  }
}

//


export const getCityById = async (req, res, next) => {
  try {
    const city = await City.findById(req.params.id)
    if (!city) return res.status(404).json({ success: false, message: "City not found" })
    res.status(200).json({ success: true, data: city })
  } catch (err) {
    next(err)
  }
}

export const updateCity = async (req, res, next) => {
  try {
    const { name, description } = req.body
    const city = await City.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    )
    if (!city) return res.status(404).json({ success: false, message: "City not found" })
    res.status(200).json({ success: true, data: city })
  } catch (err) {
    next(err)
  }
}

export const deleteCity = async (req, res, next) => {
  try {
    const city = await City.findByIdAndDelete(req.params.id)
    if (!city) return res.status(404).json({ success: false, message: "City not found" })
    res.status(200).json({ success: true, message: "City deleted" })
  } catch (err) {
    next(err)
  }
}

export const updateCityImage = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image not found." });
    }

    const city = await City.findById(id);
    if (!city) {
      return res.status(404).json({ success: false, message: "City not found" });
    }

    city.image = req.file.imagekit.url;
    await city.save();

    res.status(200).json({
      success: true,
      message: "City image updated successfully",
      image: city.image
    });
  } catch (err) {
    next(err);
  }
};

