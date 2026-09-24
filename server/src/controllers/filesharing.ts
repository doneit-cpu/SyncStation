import fs from "fs";
import path from "path";
import multer from "multer";
import { io , } from "../socket.ts";
import type { Fileinfo } from "../../../shared/types";
import { setInterval } from "timers/promises";


const filesrecords: Fileinfo[] = [];
const __dirname = path.resolve();
console.log(__dirname);
const uploadpath = path.join(__dirname, "..", "uploads");

console.log(uploadpath);

const chuckfilesdetail = new Map<string, { sortedch: number, waitingch: number[], change: boolean, file: Fileinfo }>();
const chunksize = 32 * 1024 * 1024;

const storage = multer.diskStorage({

  destination: function (req, file, callback) {
    let despath = uploadpath;
    if (req.body.filename) {
      despath = path.join(uploadpath, `${req.body.filename}${req.body.Username}`)
      if (!fs.existsSync(despath)) {
        fs.mkdirSync(despath, { recursive: true });
      }
    }
    callback(null, despath);
  },

  filename(req, file, callback) {
    if (req.body.filename) {
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

  const path = req.body.filename;

  console.log("file name", req.file.filename);
  
  const fileDetails: Fileinfo = {
    id: req.file.filename,
    sender: req.body.Username,
    name: path ? path : req.file.originalname,
    size: path ? +req.body.size : +req.file.size,
    type: path ? req.body.type : req.file.mimetype,
  };

  filesrecords.push(fileDetails);

  if (path) {
    const key = req.body.filename + req.body.Username;
    if (!chuckfilesdetail.has(key)) {
      chuckfilesdetail.set(key, { sortedch: -1, waitingch: [], change: false, file: fileDetails });
      io.to(req.body.Roomcode).emit("l-filesharing-ev", fileDetails);
    }
    const num = +req.body.sqnum;
    chunktracker(key, num);   //+ make it's number and send it okay 
  } else {
    io.to(req.body.Roomcode).emit("filesharing-ev", fileDetails); // send it to everyone 
  }

  res.status(200).json({ msg: "everything went well" });
}

// when every u make the map put value chuckfilesdetail.set(filename,-1,false)
function chunktracker(id: string, sqnum: number) {
  const temp = chuckfilesdetail.get(id);

  if (!temp) return;

  if (sqnum == temp?.sortedch + 1) {
    temp.sortedch = sqnum ;     // 1
    temp.change = true;
    let nothign = 0;
    if (temp.waitingch.length !== 0) {
      temp.waitingch.sort((a, b) => a - b);  // for sort it increase order 
      for (const num of temp.waitingch) {
        console.log(temp.sortedch, "----", num); // stop it okay ,
        if (temp?.sortedch + 1 === num) {
          temp.sortedch = num;
          nothign += 1;
        } else {
          break;
        }
      }
      temp.waitingch = temp.waitingch.slice(nothign);
      temp.change = false;
    }
  } else {
    console.log("i'm faster",sqnum);
    temp?.waitingch.push(sqnum);
  }

}

export function chuckfiles(req: any, res: any) {
  const folderName = req.params.filename;
  const chunkDir = path.join(uploadpath, folderName);

  if (!fs.existsSync(chunkDir)) {
    console.log("404 file not found shit ------------------------")
    return res.status(404).send("File not found");
  }

  const tracker = chuckfilesdetail.get(folderName);
  if (!tracker) {
    console.log("404 map -----------------------------------------")
    return res.status(404).send("lost the tracker of the selected file");
  }

  const fileMeta = tracker?.file;
  const filesize = fileMeta?.size || 0;
  const range = req.headers.range;
  let currentChunk = 0;
  const totalchunk=Math.ceil(filesize / chunksize);

  let start = 0;
  let end = filesize - 1;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    start = parseInt(parts[0], 10);
    end = parts[1] ? parseInt(parts[1], 10) : filesize - 1;
  }

  if (range) {
    console.log("phone asked for chunks !!!! ")
    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${filesize}`,
      "Content-Disposition": `attachment; filename="${tracker.file.name}"`,
      "Accept-Ranges": "bytes",
      "Content-Length": end - start + 1,
      "Content-Type": tracker.file.type,
    });
  } else {
    console.log("well it's when user has clicked it's starting");
    res.writeHead(200, {
      "Content-Length": filesize,
      "Content-Disposition": `attachment; filename="${tracker.file.name}"`,
      "Content-Type": tracker.file.type,
      "Accept-Ranges": "bytes",
    });
  }

  if (req.method === "HEAD") {
    return res.end();
  }

  streamNext(range, start);

  let retries = 3;

  async function streamNext(range: boolean = false, st: number = 0) {

    if (range) {
      currentChunk = Math.floor(st / chunksize);
    }

    if (currentChunk > tracker!.sortedch && currentChunk < totalchunk ) {
      if (range && currentChunk > tracker!.sortedch + 2) {
        res.status(416).send("Requested Range Not Satisfiable");
        return res.end();
      }
      if (retries > 0) {
        retries--;
        console.log("waiting for the currect order chunk to send ", currentChunk)
        await new Promise(resolve => setTimeout(resolve, 5000));
        return streamNext();
      } else {
        retries = 3;
        console.log("it stopped after trying 3 times ookay")
        return res.end();
      }
    }

    const chunkPath = path.join(chunkDir, `${currentChunk}`);

    console.log("this chunks has been send okay ------- ",currentChunk);

    const stream = fs.createReadStream(chunkPath, {
      start: range ? (st % chunksize) : st,
      highWaterMark: 1024 * 1024 // 1 MB buffer
    })

    stream.pipe(res, { end: false });
    stream.on("end", () => {
      console.log("this chunk has on reciver side -------------",currentChunk);
      currentChunk++;
      if(currentChunk >= totalchunk){
         console.log("All chunks sent successfully!");
         io.emit("s-normal");
         return res.end();
      }
      streamNext();
    });


    stream.on("error", (err) => {
      console.log("why the  u give it to me ",err)
      res.end();
    });
  }

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

