import express from "express";
import { fileshare ,upload ,downloadFile} from "../controllers/filesharing.ts";
const router=express.Router();

router.post("/uploads",upload.single('Files'),fileshare)// uploading while
router.get("downlods/:filename",downloadFile); // send file to client for download 

export default router;



