const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

const corsOptions = {
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
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