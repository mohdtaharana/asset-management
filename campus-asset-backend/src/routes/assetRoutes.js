import express from "express";
import { createAsset, getAssets, getAssetById, updateAsset, deleteAsset } from "../controllers/assetController.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Ensure uploads folder exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// setup multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir); // absolute path
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({ storage });

// routes
router.get("/", getAssets);
router.get("/:id", getAssetById);
router.post("/", upload.single("image"), createAsset); // image field name "image"
router.put("/:id", upload.single("image"), updateAsset); // optional: update image
router.delete("/:id", deleteAsset);

export default router;
