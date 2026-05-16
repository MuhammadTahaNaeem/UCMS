import { io } from "socket.io-client";
import { store } from "@/store";

let socket = null;

const isLocalHost = (hostName) => ["localhost", "127.0.0.1", "::1"].includes(String(hostName || "").toLowerCase());

const getSocketUrl = () => {
  if (typeof window !== "undefined") {
    const currentHost = window.location.hostname;
    const configuredUrl = import.meta.env.VITE_SOCKET_URL;

    if (configuredUrl) {
      try {
        const parsedUrl = new URL(configuredUrl, window.location.href);
        if (!isLocalHost(parsedUrl.hostname) || isLocalHost(currentHost)) {
          return configuredUrl;
        }
      } catch {
        return configuredUrl;
      }
    }

    return `${window.location.protocol}//${currentHost}:5000`;
  }

  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
  return "http://localhost:5000";
};

export const initSocket = () => {
  if (socket) return socket;

  const socketURL = getSocketUrl();
  const token = store.getState()?.auth?.token;

  socket = io(socketURL, {
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Event listeners for notifications and updates
export const onComplaintNew = (callback) => {
  if (socket) socket.on("complaint:new", callback);
};

export const onComplaintApproved = (callback) => {
  if (socket) socket.on("complaint:approved", callback);
};

export const onComplaintRejected = (callback) => {
  if (socket) socket.on("complaint:rejected", callback);
};

export const onComplaintAssigned = (callback) => {
  if (socket) socket.on("complaint:assigned", callback);
};

export const onComplaintUpdated = (callback) => {
  if (socket) socket.on("complaint:updated", callback);
};

export const onComplaintCompleted = (callback) => {
  if (socket) socket.on("complaint:completed", callback);
};

export const onNotificationNew = (callback) => {
  if (socket) socket.on("notification:new", callback);
};
