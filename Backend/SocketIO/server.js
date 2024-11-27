import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with CORS settings
const io = require("socket.io")(server, {
  cors: {
      origin: "https://your-frontend-domain.com", // Replace with your frontend's domain
      methods: ["GET", "POST"],
      credentials: true, // If using cookies or authentication
  },
  transports: ["polling", "websocket"], // Match frontend transport settings
});

// Handling socket connection
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId; // Access userId from query
  console.log("User connected:", userId);

  socket.on("disconnect", () => {
      console.log("User disconnected:", userId);
  });
});

// Store user connections
const users = {};

// Utility function to get the socket ID for a specific receiver
export const getReceiverSocketId = (receiverId) => users[receiverId] || null;

// Handle Socket.IO events
io.on("connection", (socket) => {
  try {
    const userId = socket.handshake.query.userId; // Access userId from query
    console.log("User connected:", userId);
    
    if (!userId) {
      throw new Error("User ID is required.");
    }

    users[userId] = socket.id; // Store the socket ID for the user
    console.log("Active users:", users);

    // Emit online users list
    io.emit("getOnlineUsers", Object.keys(users));

    // Handle disconnection
    socket.on("disconnect", () => {
      try {
        console.log("User disconnected:", userId);
        delete users[userId]; // Remove from active user list
        io.emit("getOnlineUsers", Object.keys(users)); // Emit updated online users
      } catch (err) {
        console.error("Error during disconnect:", err);
      }
    });
  } catch (err) {
    console.error("Error in connection:", err.message);
    socket.emit("error", "Something went wrong with the socket connection.");
  }
});


export { app, io, server };
