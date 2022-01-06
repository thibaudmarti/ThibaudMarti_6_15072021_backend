// import multer
const multer = require("multer");

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    // path for store file
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    // remove space
    const name = file.originalname.split(" ").join("_");
    // choose the right extension
    const extension = MIME_TYPES[file.mimetype];
    // remove extension from the original name
    const nameWithoutExtension = name.split("." + extension).join("_");
    // unique assembly (original name, current date . extension)
    callback(null, nameWithoutExtension + Date.now() + "." + extension);
  },
});

module.exports = multer({ storage }).single("image");
