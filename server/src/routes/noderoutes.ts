import express from "express";
import { fileshare, upload, downloadFile } from "../controllers/filesharing.ts";
const router = express.Router();

router.post("/uploads", upload.single('Files'), fileshare)// uploading while
router.get("/download/:filename", downloadFile); // send file to client for download 
router.post("/chunks", upload.single('Chunks'), fileshare)// uploading while


export default router;



