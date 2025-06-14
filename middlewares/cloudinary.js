import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinarySingle = async (req, res, next) => {
  try {
    if (!req.file) return next();

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "real-estate-files",
    });

    fs.unlinkSync(req.file.path);

    console.log("Uploaded single file to Cloudinary:");
    console.log("URL:", result.secure_url); // ✅ Full image path

    req.file.cloudinary = {
      url: result.secure_url,
      public_id: result.public_id,
    };

    next();
  } catch (err) {
    next(err);
  }
};


export const uploadToCloudinaryMultiple = async (req, res, next) => {
  try {
    if (!req.files || !Array.isArray(req.files)) return next();

    const uploads = await Promise.all(
      req.files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "real-estate-files",
        });

        fs.unlinkSync(file.path);

        console.log(`Uploaded file: ${file.originalname}`);
        console.log("URL:", result.secure_url); // ✅ Full image path

        return {
          originalname: file.originalname,
          url: result.secure_url,
          public_id: result.public_id,
        };
      })
    );

    req.cloudinaryFiles = uploads;

    next();
  } catch (err) {
    next(err);
  }
};

