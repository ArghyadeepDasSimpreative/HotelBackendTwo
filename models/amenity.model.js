// models/amenity.model.js
import mongoose from 'mongoose'

const amenitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    trim: true
  }
}, { timestamps: true })

export default mongoose.model('Amenity', amenitySchema)
