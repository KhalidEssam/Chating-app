"use client";

import  {
  useContext,
} from "react";

import {SocketContext , SocketContextType} from "@/contexts/socket/SocketContext"


export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
