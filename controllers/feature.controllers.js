import { Feature } from "../models/feature.model.js";

export const featuresCreate = async (req, res, next) => {
  try {
    const feature = await Feature.create(req.body);
    res.status(201).json({ success: true, data: feature });
  } catch (err) {
    next(err);
  }
};

export const featuresUpdate = async (req, res, next) => {
  try {
    const feature = await Feature.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!feature) return res.status(404).json({ success: false, message: "Feature not found" });
    res.json({ success: true, data: feature });
  } catch (err) {
    next(err);
  }
};

export const featuresDelete = async (req, res, next) => {
  try {
    const feature = await Feature.findByIdAndDelete(req.params.id);
    if (!feature) return res.status(404).json({ success: false, message: "Feature not found" });
    res.json({ success: true, message: "Feature deleted" });
  } catch (err) {
    next(err);
  }
};

export const featuresGetAll = async (req, res, next) => {
  try {
    const features = await Feature.find().sort({ createdAt: -1 });
    res.json({ success: true, data: features });
  } catch (err) {
    next(err);
  }
};

export const featuresGetById = async (req, res, next) => {
  try {
    const feature = await Feature.findById(req.params.id);
    if (!feature) return res.status(404).json({ success: false, message: "Feature not found" });
    res.json({ success: true, data: feature });
  } catch (err) {
    next(err);
  }
};
