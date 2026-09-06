import fs from "fs";
import path from "path";
import multer from "multer";
import { io } from "../socket.ts";
import type { Fileinfo } from "../../../shared/types";
import { Socket } from "socket.io";

const filesrecords: Fileinfo[] = [];
const __dirname = path.resolve();
console.log(__dirname);
const uploadpath = path.join(__dirname, "..", "uploads");

console.log(uploadpath);

const chuckfilesdetail = new Map<string, number[]>();

const storage = multer.diskStorage({
  destination: uploadpath,
  filename(req, file, callback) {
    callback(null, `${Date.now()}${req.body.Username || 'user'}-${file.originalname}`);
  },
});

export function downloadFile(req: any, res: any) {
  const filename = req.params.filename; // Get filename from the URL
  console.log('we are asking server to for file dinload', filename)
  const filePath = path.join(uploadpath, filename); // path to your uploads folder

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "file not found or has been deleted" });
  }

  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.sendFile(filePath);
}

const MAX_SERVER_SIZE = 1024 * 1024 * 1024;

export const upload = multer({
  storage, limits: {
    fileSize: MAX_SERVER_SIZE
  }
});

export function fileshare(req: any, res: any) {

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  console.log("file name", req.file.filename);
  console.log(req.file);

  const fileDetails: Fileinfo = {
    id: req.file.filename,
    sender: req.body.Username,
    name: req.file.originalname,
    size: req.file.size,
    type: req.file.mimetype,
  };

  filesrecords.push(fileDetails);

  io.to(req.body.Roomcode).emit("filesharing-ev", fileDetails); // send it to everyone 
  console.log("we need it ")
  res.status(200).json({ msg: "everything went well" });
}

// export function chuckfiles(req: any, res: any) {

//   if (!req.file) {
//     return res.status(400).json({ error: "No file uploaded" });
//   }

//   const username=req.body.Username;
//   chuckfilesdetail.set(username,[0]);
//   if(req)
//   chuckfilesdetail.get(username)!.push(req.body.sequencenum);

//   if(req.body.sequencenum==(req.body.filesize/32*1024*1024)-1)

// }

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
