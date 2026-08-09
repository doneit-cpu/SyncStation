import multer from "multer";
import { io } from "../server";
import type { Fileinfo } from "../../../shared/types";

const filesrecords: Fileinfo[] = [];

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename(req, file, callback) {
    callback(null, `${Date.now()}${req.body.Username || 'user'}-${file.originalname}`);
  },
});

export const upload = multer({ storage });

export function fileshare(req: any, res: any) {
 
  if (!req.file ) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const clientLanip = req.body.Lanip;  // making sure u get lanip for lan network to work fast okay 

  const download = `http://${clientLanip}:3000/uploads/${req.file.filename}`;
  console.log(req.body.Mata);
  console.log(req.file);

  const fileDetails: Fileinfo = {
    id:req.file.filename,
    sender: req.body.Username,
    name: req.file.originalname,
    size: req.file.size,
    type: req.file.mimetype, 
    downloadlink: download,
  };

  filesrecords.push(fileDetails);

  io.emit("filesharing-ev", fileDetails); // send it to everyone 
  res.status(200).json({ msg: "everything went well" });
}