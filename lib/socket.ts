import { io, Socket } from "socket.io-client";

const SOCKET_URL = `${process.env.NEXT_PUBLIC_NODE_API_URL}`;

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
});
