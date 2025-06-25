import multer from "multer";
import path from "path";
import fs from "fs";
import imagekit from "../config/imagekit.js";

const createStorage = (folderPath = "uploads") => {
  if (!fs.existsSync(folderPath)) {
    console.log(`📁 Creating upload folder at: ${folderPath}`);
    fs.mkdirSync(folderPath, { recursive: true });
  }

  return multer.diskStorage({
    destination: function (req, file, cb) {
      console.log(`📥 Saving file to: ${folderPath}`);
      cb(null, folderPath);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      console.log(`📸 Original: ${file.originalname} | Saved as: ${uniqueName}`);
      cb(null, uniqueName);
    },
  });
};

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|svg|webp|pdf|jfif/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) {
    console.log(`✅ Accepted file type: ${file.originalname}`);
    cb(null, true);
  } else {
    console.log(`❌ Rejected file type: ${file.originalname}`);
    cb(new Error("Unsupported file type"), false);
  }
};

const getMulter = (folderPath = "uploads") =>
  multer({
    storage: createStorage(folderPath),
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
  });

export const uploadSingleFile = (fieldName, folderPath = "uploads") => {
  // console.log(`🧾 Setting up single file upload for key: ${fieldName}`);
  return getMulter(folderPath).single(fieldName);
};

export const uploadMultipleFiles = (fieldName, maxCount = 5, folderPath = "uploads") => {
  // console.log(`🧾 Setting up multiple file upload for key: ${fieldName}, max count: ${maxCount}`);
  return getMulter(folderPath).array(fieldName, maxCount);
};

export const handleMulterErrors = (multerMiddleware) => {
  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError || err.message === "Unsupported file type") {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      if (err) return next(err);
      next();
    });
  };
};


export const uploadToImageKit = async (req, res, next) => {
  try {
    if (!req.file) return next();

    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);

    const result = await imagekit.upload({
      file: fileBuffer,
      fileName: req.file.filename,
      folder: "real-estate-app/cities",
    });

    fs.unlinkSync(filePath); // Delete local file after upload

    req.file.imagekit = {
      url: result.url,
      fileId: result.fileId,
    };

    console.log("image is ", req.file.imagekit);

    next();
  } catch (err) {
    next(err);
  }
};


