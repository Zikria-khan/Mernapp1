import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRoute from "./routes/user.route.js";
import messageRoute from "./routes/message.route.js";
import { app, server } from "./SocketIO/server.js";

dotenv.config();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Basic CORS Configuration
app.use(
  cors({
    origin: "https://mernapp1-i423.vercel.app", // Allow the frontend app domain
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allow all common HTTP methods
    credentials: true, // Allow cookies to be included in requests
  })
);



app.get("/", (req, res) => {
  res.status(200).json({
    message: "Success is come only believe",
  });
});

const PORT = process.env.PORT || 3001;
const URI = process.env.MONGODB_URI;

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/user", userRoute);
app.use("/api/message", messageRoute);

// Start the Server
server.listen(PORT, () => {
  console.log(`Server is Running on port ${PORT}`);
});
