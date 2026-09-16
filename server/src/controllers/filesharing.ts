import fs from "fs";
import path from "path";
import multer from "multer";
import { io ,lfiledetail } from "../socket.ts";
import type { Fileinfo } from "../../../shared/types";
import { setInterval } from "timers/promises";

const filesrecords: Fileinfo[] = [];
const __dirname = path.resolve();
console.log(__dirname);
const uploadpath = path.join(__dirname, "..", "uploads");

console.log(uploadpath);

const chuckfilesdetail =lfiledetail; 
const chunksize=32*1024*1024;

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

  const tracker=chuckfilesdetail.get(req.body.folderName);

  if (!fs.existsSync(chunkDir)) {
    return res.status(404).send("File not found");
  }

  const fileMeta = chuckfilesdetail.get(req.body.filename)?.file;
  const filesize = fileMeta?.size || 0;
  const range = req.headers.range;
  let currentChunk = 0;     // this glboal for this function any one belowe can changed 

  if (range && filesize > 0) {     //resume download   // see this only 
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : filesize - 1;  // here if resume come i seen online it's only send like bytes=63534+64- ,, so here path would nothign , so it would give end has 50gb-1 ? just think of it okay ?   // see this only 

    const chunknum = Math.floor(start / chunksize);
    currentChunk=chunknum;
    const offsetInChunk = start % chunksize;      // what is this , if i'm sending or increasing thing but exect 32 mb which i had  plan ,   
    const chunkPath = path.join(chunkDir, `${chunknum}`);

    if (!fs.existsSync(chunkPath)) {  // add our logic here okay wiating 15 sec or something don't send 404 or something shit lilke that 
      return res.status(404).send("Chunk not found");
    }

    const bytesToSend = end - start + 1;    // what's used of this , we don't know it would send the specific chunk or resume request ?it's depened on os downloader which we don't know at all so ?    // see this only 
    res.writeHead(206, {       // if this res make asked circle or this fetch response we don't even send it ? 
      "Content-Range": `bytes ${start}-${end}/${filesize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": bytesToSend,
      "Content-Type": "application/octet-stream",
    });

    const stream = fs.createReadStream(chunkPath, {     // this would sending more than 32mb by reading simply more , okay 
      start: offsetInChunk,
    });

    
    return stream.pipe(res); 
  }
  
  streamNext()

  if(currentChunk==0){
    res.writeHead(200, {          // how is this not overwirte yet ? can u tell me ? 
      "Content-Length": filesize,
      "Content-Disposition": `attachment; filename="${req.body.filename}"`,
      "Content-Type": "application/octet-stream",
      "Accept-Ranges": "bytes",
    });
  }

  const totalChunks = Math.ceil(filesize / chunksize);    // yeah this okay
  let retries=3;

  async function streamNext() {     // if this repeat it self where it's info about https range or i'm sending in the order so it's don't matter ? 
    if (currentChunk >= tracker!.sortedch) {    // i have made the spical map chunkdetailmap here which can tell how many are read avaible at time // i'm getting at time ? 
      let Timeinterval;
      if(retries>0){
        Timeinterval= await setTimeout(()=>{
          streamNext();
        },1000*15)
      }else{
        retries=3;
        return res.end();    // make simple 30 or 15 sec waiting block that's all and called this again , 
      }
      clearTimeout(Timeinterval);
    }

    const chunkPath = path.join(chunkDir, `${currentChunk}`);
    
    const stream = fs.createReadStream(chunkPath);   //does this repeat it's self ? 
    stream.pipe(res, { end: false });

    stream.on("end", () => {     // what this do ? 
      currentChunk++;
      streamNext();
    });

    stream.on("error", () => {
      res.end();
    });
  }
 
  streamNext();    // how we got this whatever like data piple closed or will it closed on auto in how much interval if nothing send through this ?   // if called this like from background of client will it send the file ? but main point it's download so will it work on not , ik fetch can do work without user click or action 
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




 