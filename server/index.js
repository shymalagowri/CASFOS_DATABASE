const express = require('express');
const cors = require('cors');
const dbConnect = require('./config/DbConnect');
const userRoutes = require('./routes/UserRoutes');
const assetRoutes = require("./routes/AssetRoutes");
const facultyRoutes = require('./routes/FacultyRoutes');
require('dotenv').config();
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use('/api/users', userRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/faculty', facultyRoutes);

const port = process.env.PORT || 3050;

const start = async () => {
    try {
        await dbConnect();
        app.listen(port, () => {
            //(`Server is listening on port ${port}...`);
        });
    } catch (error) {
        console.error(error);
    }
};

start();
