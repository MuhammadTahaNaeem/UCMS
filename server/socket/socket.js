import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

let ioInstance = null;

const parseCookies = (cookieHeader = "") => {
  return cookieHeader.split(";").map(c => c.trim()).reduce((acc, pair) => {
    const [k, v] = pair.split("=");
    if (k && v) acc[k] = decodeURIComponent(v);
    return acc;
  }, {});
};

export const initSocket = (server) => {
  if (ioInstance) return ioInstance;
  ioInstance = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === "production" ? (process.env.CLIENT_ORIGIN || "http://localhost:5173") : true,
      credentials: true,
    },
  });

  ioInstance.use(async (socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie || "";
      const cookies = parseCookies(cookieHeader);
      const token = cookies.token || (socket.handshake.auth && socket.handshake.auth.token);
      if (!token) return next(new Error("Authentication required"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-password");
      if (!user) return next(new Error("Authentication required"));
      socket.user = user;
      return next();
    } catch (err) {
      return next(new Error("Authentication required"));
    }
  });

  ioInstance.on("connection", (socket) => {
    if (socket.user) {
      socket.join(socket.user._id.toString());
      if (socket.user.role === "Admin") {
        // Admins join a department room for targeted notifications
        if (socket.user.department) socket.join(`department_${socket.user.department.toString()}`);
      }
      if (socket.user.role === "SuperAdmin") {
        // SuperAdmins receive global stream
        socket.join("super-room");
      }
    }

    socket.on("disconnect", () => {});
  });

  return ioInstance;
};

export const getIO = () => ioInstance;
