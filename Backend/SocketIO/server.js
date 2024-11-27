import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with CORS settings
const io = new Server(server, {
  cors: {
    origin: "https://mernapp1.vercel.app", // Allow requests from this origin
    methods: ["GET", "POST"],            // Allow these HTTP methods
  },
});

// Store user connections
const users = {};

// Utility function to get the socket ID for a specific receiver
export const getReceiverSocketId = (receiverId) => users[receiverId] || null;

// Handle Socket.IO events
io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  // Retrieve `userId` from query parameters
  const userId = socket.handshake.query.userId;
  if (userId) {
    users[userId] = socket.id; // Map `userId` to `socket.id`
    console.log("Active users:", users);
  }

  // Emit the list of online users to all connected clients
  io.emit("getOnlineUsers", Object.keys(users));

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    if (userId) {
      delete users[userId]; // Remove user from active list
      io.emit("getOnlineUsers", Object.keys(users)); // Update online users
    }
  });
});

export { app, io, server };
