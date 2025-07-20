const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + file.fieldname + ext);
  },
});

// Enhanced fileFilter to allow both images and JSON
// const fileFilter = (req, file, cb) => {
//   const ext = path.extname(file.originalname).toLowerCase();

//   const imageTypes = [".jpeg", ".jpg", ".png", ".gif"];
//   const isImage = imageTypes.includes(ext);

//   const isJson =
//     file.mimetype === "application/json" || ext === ".json";

//   if (isImage || isJson) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only images or JSON files are allowed"), false);
//   }
// };
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  console.log("Incoming file:", {
    originalname: file.originalname,
    mimetype,
    extension: ext,
  });

  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/json", // ✅ Allow JSON
  ];

  const isAllowed = allowedMimeTypes.includes(mimetype) || ext === ".json";

  if (isAllowed) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Rejected file: ${file.originalname}, mimetype: ${mimetype}, ext: ${ext}. Only images or JSON are allowed.`
      ),
      false
    );
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;