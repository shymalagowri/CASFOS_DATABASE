const express = require('express');
const cors = require('cors');
const dbConnect = require('./config/DbConnect');
const userRoutes = require('./routes/UserRoutes');
const assetRoutes = require('./routes/AssetRoutes');
const facultyRoutes = require('./routes/FacultyRoutes');
require('./backupAndRestore');
require('dotenv').config();
const path = require('path');
const app = express();
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

const port = process.env.PORT || 3050;

const start = async () => {
  try {
    console.log('Connecting to database...');
    await dbConnect();
    console.log('Database connected');
    app.listen(port, 'localhost', () => {
      console.log(`Server is listening on http://localhost:${port}...`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
  }
};

start();