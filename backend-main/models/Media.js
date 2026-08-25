const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
    {
        image_name: {
            type: String,
            required: true,
        },

        mimeType: {
            type: String,
            required: true,
        },

        size: {
            type: Number,
            required: true,
        },

        s3Key: { type: String, required: true }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Media", mediaSchema);