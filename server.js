const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();



app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json',
  );
  next();
});




// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});
app.use((req, res, next) => {
  console.log('->', req.method, req.originalUrl);
  next();
});
// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  const adminExists = await User.findOne({ role: 'admin' });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await User.create({
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: 'admin'
    });

    console.log("✅ Admin created");
  }
}

createAdmin();

const applyRoutes = require("./routes/apply");

app.use("/api/apply", applyRoutes);

const reviewRoutes = require('./routes/reviews');

app.use('/api/reviews', reviewRoutes);
app.use('/uploads', express.static('uploads'));

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const galleryRoutes = require('./routes/gallery');

app.use('/api/gallery', galleryRoutes);

const studentRoutes = require('./routes/student');
app.use('/api/student', studentRoutes);

const examRoutes = require('./routes/exam'); 
app.use('/api/exam', examRoutes); 

app.use('/api/announcement', require('./routes/announcement'));

const sliderRoutes = require('./routes/slider');

app.use('/api/slider', sliderRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));