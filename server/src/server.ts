import express from "express";
import http from "http";
import { Server } from "socket.io";
import { t_content } from "./controllers/clipboard.ts"
import { setupSocket } from "./socket.ts"
const app = express();
const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.get("/getgpt", t_content);

setupSocket(io);
server.listen(3000, () => {
  console.log("Server is running on port 3000");
});