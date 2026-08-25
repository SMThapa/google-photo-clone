const express = require("express");

const router = express.Router();

const upload = require("../middleware/upload");

const {
    uploadImages,
    getAllImages,
    getImageById,
    deleteImages,
} = require("../controllers/mediaController");

router.post(
    "/upload",
    upload.array("images", 50),
    uploadImages
);

router.get("/", getAllImages);

router.get("/:id", getImageById);

router.delete("/", deleteImages);

module.exports = router;