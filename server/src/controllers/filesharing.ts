import fs from "fs";
import path from "path";
import multer from "multer";
import { io } from "../socket.ts";
import type { Fileinfo } from "../../../shared/types";

const filesrecords: Fileinfo[] = [];
const uploadpath=path.join(process.cwd(), "..", "uploads");
console.log(uploadpath);
const storage = multer.diskStorage({
  destination: uploadpath,
  filename(req, file, callback) {
    callback(null, `${Date.now()}${req.body.Username || 'user'}-${file.originalname}`);
  },
});

export const upload = multer({ storage });

export function fileshare(req: any, res: any) {

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const clientLanip = req.body.Lanip;  // making sure u get lanip for lan network to work fast okay 

  const download = `http://${clientLanip}:3000/uploads/${req.file.filename}`;
  console.log(req.body.Mata);
  console.log(req.file);

  const fileDetails: Fileinfo = {
    id: req.file.filename,
    sender: req.body.Username,
    name: req.file.originalname,
    size: req.file.size,
    type: req.file.mimetype,
    downloadlink: download,
  };

  filesrecords.push(fileDetails);

  io.emit("filesharing-ev", fileDetails); // send it to everyone 
  console.log("we need it ")
  res.status(200).json({ msg: "everything went well" });
}


const THREE_HOURS_IN_MS = 3 * 60 * 60 * 1000;

export const startCleanup = (folderPath: string) => {
  // Run immediately on startup
  performCleanup(folderPath);

  // Run every 3 hours
  setInterval(() => {
    performCleanup(folderPath);
  }, THREE_HOURS_IN_MS);
};

const performCleanup = (folderPath: string) => {
  console.log(`[Cleanup] Scanning directory: ${folderPath}`);

  if (!fs.existsSync(folderPath)) {
    console.warn(`[Cleanup] Directory does not exist: ${folderPath}`);
    return;
  }

  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error("[Cleanup] Error reading directory:", err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(folderPath, file);

      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(`[Cleanup] Could not stat file ${file}:`, err);
          return;
        }

        
        if (stats.isFile()) {
          const ageInMs = Date.now() - stats.mtimeMs;

          if (ageInMs > THREE_HOURS_IN_MS) {
            fs.unlink(filePath, (unlinkErr) => {
              if (unlinkErr) {
                console.error(`[Cleanup] Failed to delete ${file}:`, unlinkErr);
              } else {
                console.log(`[Cleanup] Successfully deleted: ${file}`);
              }
            });
          }
        }
      });
    });
  });
};
