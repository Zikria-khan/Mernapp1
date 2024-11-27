import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import io from "socket.io-client";

// Create a context for managing WebSocket connection and online users
const SocketContext = createContext();

// Custom hook for consuming the SocketContext
export const useSocketContext = () => {
  return useContext(SocketContext);
};

// SocketProvider component to manage the WebSocket connection
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null); // State for the socket connection
  const [onlineUsers, setOnlineUsers] = useState([]); // State for tracking online users
  const [authUser] = useAuth(); // Get the authenticated user from AuthProvider

  // Manage the WebSocket connection when `authUser` changes
  useEffect(() => {
    if (authUser) {
      // Establish the socket connection with userId as a query parameter
      const newSocket = io("https://mernapp1.vercel.app", {
        query: { userId: authUser.user._id },
      });

      setSocket(newSocket); // Save the socket instance in state

      // Listen for the 'getOnlineUsers' event to update the online users list
      newSocket.on("getOnlineUsers", (users) => {
        setOnlineUsers(users); // Update online users in state
      });

      // Clean up the socket connection on unmount or when `authUser` changes
      return () => {
        newSocket.close();
      };
    } else {
      // Close the socket if the user logs out
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [authUser]);

  // Provide the socket instance and online users list to children components
  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
