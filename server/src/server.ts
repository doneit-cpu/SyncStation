import express from "express";
import http from "http";
import path from "path";
import fs from "fs";
import { tunnelmole } from "tunnelmole"
import { Server } from "socket.io";


import { t_content } from "./controllers/clipboard.ts"
import { setupSocket } from "./socket.ts"

const app = express();
const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.get("api/getgpt", t_content);

const __dirname=path.resolve()

app.use(express.static(path.join(__dirname, ".." ,"client","dist")))

const clientDistPath = path.join(__dirname, ".." , "client", "dist");

app.get("api/status",(req,res)=>{
  res.json({status:"SyncStation is Online"})
})

if (fs.existsSync(clientDistPath)) {
    console.log("✅ Frontend folder found at:", clientDistPath);
} else {
    console.error("❌ Frontend folder NOT found at:", clientDistPath);
    console.log("Current directory is:", __dirname);
}

app.get((req:any, res:any) => {
  res.sendFile(path.join(__dirname, "client","dist","index.html"));
});

setupSocket(io);

server.listen(3000, '0.0.0.0', async () => {
  const url = await tunnelmole({
    port: 3000
  })
  console.log("public url", url);
});


