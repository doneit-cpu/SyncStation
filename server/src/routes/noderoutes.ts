import express from "express";
import { fileshare ,upload} from "../controllers/filesharing.ts";
const router=express.Router();

router.post("/uploads",upload.single('Files'),fileshare)// uploading while


export default router;



