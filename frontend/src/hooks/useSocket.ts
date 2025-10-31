// src/hooks/useSocket.ts
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Transaction } from "../types/transaction";

export default function useSocket(
  onNew: (tx: Transaction) => void,
  onFlagged: (tx: Transaction) => void
) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // const socket = io(import.meta.env.VITE_WS_URL || "http://localhost:3000");
    const socket = io("http://localhost:3000");
    socketRef.current = socket;

    socket.on("connect", () => console.log("socket connected"));
    socket.on("newTransaction", (tx: Transaction) => onNew(tx));
    socket.on("flaggedTransaction", (tx: Transaction) => onFlagged(tx));

    return () => {
      socket.disconnect();
    };
  }, [onNew, onFlagged]);

  return socketRef;
}
