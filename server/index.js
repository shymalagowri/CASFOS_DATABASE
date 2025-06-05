const express = require('express');
const cors = require('cors');
const dbConnect = require('./config/DbConnect');
const userRoutes = require('./routes/UserRoutes');
const assetRoutes = require('./routes/AssetRoutes');
const facultyRoutes = require('./routes/FacultyRoutes');
require('dotenv').config();
const path = require('path');
const app = express();
require('./backupAndRestore');
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

// Root route for wait-on
app.get('/', (req, res) => {
  res.status(200).send('Server is running');
});

app.use('/api/users', userRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/faculty', facultyRoutes);

const port = process.env.PORT || 3000;
const host = process.env.IP || 'localhost'; // Fetch IP/host from .env
console.log(`Server will run on http://${host}:${port}`);
const start = async () => {
  try {
    console.log('Connecting to database...');
    await dbConnect();
    console.log('Database connected');

    app.listen(port, host, () => {
      console.log(`Server is listening on http://${host}:${port}...`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
  }
};
start();