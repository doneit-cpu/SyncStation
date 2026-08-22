import fs from "fs";
import path from "path";
import express from "express";
import https from "https";
import { tunnelmole } from "tunnelmole"
import cors from "cors";

import noderoutes from "./routes/noderoutes.ts"
import { setupSocket } from "./socket.ts"
import { getLocalIp } from "./utlis.ts"
import { startCleanup } from './controllers/filesharing.ts'
const app = express();

const key = fs.readFileSync(path.join(process.cwd(),"key.pem"));
const cert = fs.readFileSync(path.join(process.cwd(),"cert.pem"));

const server = https.createServer({ key,cert},app);

setupSocket(server);

app.use(cors({
  origin: "*", // Allow requests from any origin (fine for a local tool)
  methods: ["GET", "POST"],
}));

app.use(express.json());
app.use("/api/files",cors(),noderoutes)

app.get("/api/ping", (req, res) => {   //check user same lan network as server 
  res.status(200).json({ ok: true });
})

const __dirname = path.resolve()
console.log(__dirname);
const uploadpath=path.join(__dirname,"..","uploads")  // storage for file sharing 
app.use("/uploads", express.static(uploadpath))  
console.log(uploadpath ,"uploadpath");

const clientDistPath = path.join(__dirname,"..","client", "dist");  // Frontend

app.use(express.static(clientDistPath));

app.get("api/status", (req, res) => {
  res.json({ status: "SyncStation is Online" })
})

if (fs.existsSync(clientDistPath)) {
  console.log("✅ Frontend folder found at:", clientDistPath, getLocalIp());
} else {
  console.error("❌ Frontend folder NOT found at:", clientDistPath);
  console.log("Current directory is:", __dirname);
}

app.get("/{*all}",(req: any, res: any) => {
  res.sendFile(path.join(__dirname,"..", "client", "dist", "index.html"));
});

server.listen(3000, '0.0.0.0', async () => {
  console.log(`https://${getLocalIp()}:3000/`)
  startCleanup(uploadpath);
});



