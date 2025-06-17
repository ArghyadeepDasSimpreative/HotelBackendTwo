import fs from "fs";
import path from "path";

export const deleteFile = (fileName) => {
  const filePath = path.join("uploads", fileName);

  try {
    if (!fs.existsSync(filePath)) return false;

    fs.unlinkSync(filePath);
    return true;
  } catch (err) {
    console.log("Error deleting file:", err);
    return false;
  }
};
