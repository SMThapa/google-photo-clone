const mongoose = require("mongoose");

const connectDB = async () => {

    const mongo_url = process.env.MONGO_URI

    try {
        await mongoose.connect(mongo_url);

        console.log("MongoDB Connected");
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

module.exports = connectDB;