const {
    S3Client,                  //connects to s3
    PutObjectCommand,         //upload file
    GetObjectCommand,        //download file
    DeleteObjectsCommand    //delete file
} = require("@aws-sdk/client-s3");

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const Media = require("../models/Media");
const { v4: uuidv4 } = require("uuid");

const s3 = new S3Client({ region: process.env.AWS_REGION });
const BUCKET = process.env.S3_BUCKET_NAME;

const uploadImages = async (req, res) => {
    try {
        const files = req.files;

        if (!files?.length) {
            return res.status(400).json({ message: "No files uploaded" });
        }

        const mediaDocs = await Promise.all(
            files.map(async (file) => {
                const s3Key = `images/${uuidv4()}-${file.originalname}`;

                await s3.send(new PutObjectCommand({
                    Bucket: BUCKET,
                    Key: s3Key,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                }));

                return {
                    image_name: file.originalname,
                    mimeType: file.mimetype,
                    size: file.size,
                    s3Key,                          // store the key, not the buffer
                };
            })
        );

        await Media.insertMany(mediaDocs);

        res.status(201).json({ message: `${files.length} images uploaded` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Upload failed" });
    }
};

// const getAllImages = async (req, res) => {
//     try {
//         // no change here — we never stored `data` in mongo anyway
//         const images = await Media.find({}, {
//             image_name: 1,
//             mimeType: 1,
//             size: 1,
//             createdAt: 1            
//         });

//         res.status(200).json(images);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Failed to fetch images" });
//     }
// };

const getAllImages = async (req, res) => {
    try {
        const images = await Media.find(
            {},
            {
                image_name: 1,
                mimeType: 1,
                size: 1,
                createdAt: 1,
                s3Key: 1
            }
        );

        const imagesWithUrls = await Promise.all(
            images.map(async (image) => {

                const command = new GetObjectCommand({
                    Bucket: BUCKET,
                    Key: image.s3Key
                });

                const imageUrl = await getSignedUrl(
                    s3,
                    command,
                    {
                        expiresIn: 3600
                    }
                );

                return {
                    ...image.toObject(),
                    imageUrl
                };
            })
        );

        res.status(200).json(imagesWithUrls);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch images"
        });
    }
};

const getImageById = async (req, res) => {
    try {
        const image = await Media.findById(req.params.id);
        if (!image) return res.status(404).json({ message: "Image not found" });

        // Option A — stream the image through your server
        const command = new GetObjectCommand({ Bucket: BUCKET, Key: image.s3Key });
        const s3Response = await s3.send(command);

        res.set("Content-Type", image.mimeType);
        s3Response.Body.pipe(res);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch image" });
    }
};

const deleteImages = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids?.length) return res.status(400).json({ message: "No image ids provided" });

        const images = await Media.find({ _id: { $in: ids } }, { s3Key: 1 });

        // delete from S3 first
        await s3.send(new DeleteObjectsCommand({
            Bucket: BUCKET,
            Delete: {
                Objects: images.map((img) => ({ Key: img.s3Key })),
            },
        }));

        // then remove mongo docs
        const result = await Media.deleteMany({ _id: { $in: ids } });

        res.status(200).json({ message: `${result.deletedCount} images deleted` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to delete images" });
    }
};

module.exports = {
    uploadImages,
    getAllImages,
    getImageById,
    deleteImages,
};