import { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const s = io("http://localhost:3000"); // replace with your server URL
    setSocket(s);

    s.on("connect", () => {
      console.log("Connected to socket:", s.id);
    });

    s.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      s.disconnect();
    };
  }, []);

  // Wait until socket is ready
  if (!socket) return null;

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
