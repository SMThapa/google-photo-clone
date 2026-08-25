require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./db");

const mediaRoutes = require("./routes/mediaRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

connectDB();
app.use(cors());
app.use(express.json());

app.use("/api/media", mediaRoutes);
app.use("/api/auth", authRoutes);

app.listen(5000, () => {
    console.log('http://localhost:5000/api')
    console.log(`Server running on port 5000`);
});