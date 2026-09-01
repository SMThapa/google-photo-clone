require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./db");

const mediaRoutes = require("./routes/mediaRoutes");
const authRoutes = require("./routes/authRoutes");
const { register, httpRequestDuration, httpRequestCounter } = require('./metrics');

const app = express();

connectDB();
app.use(cors());
app.use(express.json());

// Middleware to time every request
app.use((req, res, next) => {
    const end = httpRequestDuration.startTimer();
    res.on('finish', () => {
        const route = req.route ? req.baseUrl + req.route.path : 'unmatched';
        end({ method: req.method, route, status_code: res.statusCode });
        httpRequestCounter.inc({ method: req.method, route, status_code: res.statusCode });
    });
    next();
});

app.use("/api/media", mediaRoutes);
app.use("/api/auth", authRoutes);

// Metrics endpoint for Prometheus to scrape
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

app.listen(5000, () => {
    console.log('http://localhost:5000/api')
    console.log(`Server running on port 5000`);
});