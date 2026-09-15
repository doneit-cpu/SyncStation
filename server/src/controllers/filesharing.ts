import fs from "fs";
import path from "path";
import multer from "multer";
import { io ,lfiledetail } from "../socket.ts";
import type { Fileinfo } from "../../../shared/types";

const filesrecords: Fileinfo[] = [];
const __dirname = path.resolve();
console.log(__dirname);
const uploadpath = path.join(__dirname, "..", "uploads");

console.log(uploadpath);

 const chuckfilesdetail =lfiledetail; 


const storage = multer.diskStorage({

  destination: function (req, file, callback) {
    let despath = uploadpath;
    if (req.body.path) {
      despath = path.join(uploadpath, `${req.body.path}+${req.body.Username}`)

      if (!fs.existsSync(despath)) {
        fs.mkdirSync(despath, { recursive: true });
      }
      callback(null, despath)
    }
  },

  filename(req, file, callback) {
    if (req.body.path) {
      callback(null, `${req.body.sqnum}`);
    } else {
      callback(null, `${Date.now()}${req.body.Username || 'user'}-${file.originalname}`);
    }
  },

});

// how do i make new const storage for chunks ( so each file get there own folder and i can send them and pich it from there okay , and name fo the file would #1,...!goes on so)

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


  if (req.body.path) {
    chunktracker(req.body.path, req.body.sqnum);
  }

  filesrecords.push(fileDetails);

  io.to(req.body.Roomcode).emit("filesharing-ev", fileDetails); // send it to everyone 
  console.log("we need it ")
  res.status(200).json({ msg: "everything went well" });
}

// when every u make the map put value chuckfilesdetail.set(filename,-1,false)
function chunktracker(id: string, sqnum: number) {
  const temp = chuckfilesdetail.get(id);

  if(!temp) return;

  if (temp?.change) {                       // 4comes , bcs of the 0 and 1 correct now we have to put in order them and do this agin 
    let nothign = 0;
    if (temp.waitingch.length !== 0) {
      temp.waitingch.sort((a, b) => a - b);
      temp.waitingch.forEach((num) => {
        if (temp?.sortedch + 1 == num) {
          temp.sortedch = num;
          nothign += 1;

        }
      })
      temp.waitingch = temp.waitingch.slice(0, nothign);
      temp.change = false; 19
    }
  }
  if (sqnum + 1 == temp?.sortedch) {    //0 , 1 not came , but 2 come fist so , 3 
    temp.sortedch = sqnum;          //1
    temp.change = true;           // true
  } else {
    temp?.waitingch.push(sqnum);    // 2 goes here , 3
  }
}


export function chuckfiles(req: any, res: any) {
  const folderName = `${req.body.filename}+${req.body.Username}`;
  const chunkDir = path.join(uploadpath, folderName);

  if (!fs.existsSync(chunkDir)) {
    return res.status(404).send("File not found");
  }

  const fileMeta = chuckfilesdetail.get(req.body.filename)?.file;
  const filesize = fileMeta?.size || 0;
  const range = req.headers.range;

  if (range && filesize > 0) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : filesize - 1;

    const chunknum = Math.floor(start / CHUNK_SIZE);
    const offsetInChunk = start % CHUNK_SIZE;
    const chunkPath = path.join(chunkDir, `${chunknum}`);

    if (!fs.existsSync(chunkPath)) {
      return res.status(404).send("Chunk not found");
    }

    const bytesToSend = end - start + 1;
    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${filesize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": bytesToSend,
      "Content-Type": "application/octet-stream",
    });

    const stream = fs.createReadStream(chunkPath, {
      start: offsetInChunk,
      end: offsetInChunk + bytesToSend - 1,
    });
    return stream.pipe(res);
  }

  res.writeHead(200, {
    "Content-Length": filesize,
    "Content-Disposition": `attachment; filename="${req.body.filename}"`,
    "Content-Type": "application/octet-stream",
    "Accept-Ranges": "bytes",
  });

  const totalChunks = Math.ceil(filesize / CHUNK_SIZE);
  let currentChunk = 0;

  

  

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




 