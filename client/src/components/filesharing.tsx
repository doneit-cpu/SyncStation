import { useState, useRef, useEffect } from 'react';
import { FileText, Image as ImageIcon, Music, FileCode, Archive, Eye, Download, } from 'lucide-react';
import axios from 'axios';

import type { Fileinfo } from '../services/utlis.ts';
import { useSync } from '../context/syncontext';
import { socket } from '../services/socket.ts';

interface UploadProgress {
  percentage: number;
  speed: string;
  timeRemaining: string;
  status: 'uploading' | 'completed' | 'failed';
}

const Filesharing = () => {

  const MAX_CLIENT_SIZE = 1024 * 1024 * 1024;

  const { Lanip, setalert, username, fileshareMap, room } = useSync();
  const filesArray = Array.from<Fileinfo>(fileshareMap.values());
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadstate, setuploadstate] = useState<Record<string, UploadProgress>>({});
  const fileinputRef = useRef<HTMLInputElement>(null);
  const chunkfilepointer = useRef<File>(null);
  const chunksize = 32 * 1024 * 1024;


  const chunkuplad = async (file: File, resume: boolean, lastseq: number) => {
    const total_num = Math.ceil(file.size / chunksize);
    let seq_num = 0;
    let offsetchuk = 0;

    if (resume) {
      seq_num = lastseq;
    }

    const uploading = async () => {
      while (seq_num < total_num) {
        let retries = 3;
        let success = false;
        const myseq = seq_num++;
        const formdata = new FormData();   // this okay ,it creat new fomdata each time bro , like during all ? same again right 
        formdata.append('Username', username);
        formdata.append('Roomcode', room);
        formdata.append('sqnum', myseq.toString());
        formdata.append('path',file.name)

        offsetchuk = myseq * chunksize;
        const end = Math.min(file.size, offsetchuk + chunksize!);
        const chunkRef = file.slice(offsetchuk, end);
        formdata.append('Chunks', chunkRef);

        while (!success && retries > 0) {
          try {
            await axios.post(`https://${Lanip}:3000/api/files/chunks`, formdata)
            success = true; // Move to next chunk
          } catch (err) {
            retries--;
            if (retries === 0) {
              console.error(`Fatal: Chunk ${myseq} permanently failed.`);
            }
            await new Promise(r => setTimeout(r, 1000)); // Wait 1s before retry
          }
        }
      }
    }
    // it just make function calling for the woker at starter 
    const promise: Promise<void>[] = []
    for (let i = 0; i < 4; i++) {
      promise.push(uploading());
    }
    await Promise.all(promise);  // it lunch all staters

  }

  useEffect(() => {
    socket.on("resume-D", (data: number, filename: string) => {
      if (chunkfilepointer.current) {
        chunkuplad(chunkfilepointer.current, true, data)// how put file here or something like when browser refresh lost connectin wifi changed ? how get file pointer here any way 
      } else {
        if (filename) {
          setalert({ "message": `Pls select ${filename} for resuming large file upload`, "type": "warning" })
        }
      }
    })

    if (chunkfilepointer.current) {
      socket.emit("resume-info", chunkfilepointer.current.name)
    }
    return () => {
      socket.off("resume-D")
    }
  }, [socket])


  const handleUpload = async (files: File[]) => {

    if (files.length === 0) {
      setalert({ message: "Please select a file first", type: "warning" });
      return;
    };

    const validFiles = files.filter(file => {
      if (file.size > MAX_CLIENT_SIZE) {
        // splits file into 32mb chunks and then upload it 
        chunkfilepointer.current = file;
        console.log(chunkfilepointer);
        chunkuplad(file, false, 0);
        return false;
      } else {
        return true;
      }
    });


    if (validFiles.length === 0) return;

    await Promise.all(
      files.map(async (file) => {
        const formdata = new FormData();
        formdata.append('Files', file);
        formdata.append('Username', username);
        formdata.append('Roomcode', room)

        const startTime = Date.now();
        const fileKey = `${file.name}-${file.size}-${startTime}`;

        setuploadstate(prev => ({ ...prev, [fileKey]: { percentage: 0, speed: '0 KB/s', timeRemaining: '', status: 'uploading' } }));

        try {
          await axios.post(`https://${Lanip}:3000/api/files/uploads`, formdata, {
            onUploadProgress: (ProgressEvent) => {
              const { loaded, total } = ProgressEvent;
              if (!total) return;

              const currentPercent = Math.floor((loaded * 100) / total);
              const totalTimeSeconds = Math.max(
                (Date.now() - startTime) / 1000,
                0.001
              );
              const bytespersecound = loaded / totalTimeSeconds;

              const speed = bytespersecound > 1024 * 1024
                ? `${(bytespersecound / (1024 * 1024)).toFixed(2)} MB/s`
                : `${(bytespersecound / 1024).toFixed(2)} KB/s`;

              setuploadstate(prev => ({
                ...prev,
                [fileKey]: { ...prev[fileKey], percentage: currentPercent, speed: speed }
              }));
            },
          });
          setuploadstate(prev => ({ ...prev, [fileKey]: { ...prev[fileKey], status: 'completed' } }));
        } catch (err) {
          console.error(err);
          setuploadstate(prev => ({ ...prev, [fileKey]: { ...prev[fileKey], status: 'failed' } }));
        }
      }));
  }

  const handleDownload = async (id: string, name: string) => {
    try {
      const response = await fetch(`https://${Lanip}:3000/api/files/download/${id}`);
      if (response.status === 404) {
        setalert({ message: "File not found or has been deleted.", type: "error" });
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error(err)
      setalert({ message: "Download failed.", type: "error" });
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-4 h-4 text-cyan-400" />;
    if (mimeType.startsWith('audio/')) return <Music className="w-4 h-4 text-purple-400" />;
    if (mimeType.includes('pdf') || mimeType.includes('text')) return <FileText className="w-4 h-4 text-emerald-400" />;
    if (mimeType.includes('json') || mimeType.includes('javascript')) return <FileCode className="w-4 h-4 text-blue-400" />;
    return <Archive className="w-4 h-4 text-slate-400" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-2">
        {Object.entries(uploadstate).map(([key, state]) => (
          state.status === 'uploading' && (
            <div key={key} className="bg-slate-900 border border-slate-800 p-2 rounded-lg">
              <p className="text-[10px] text-slate-300 font-mono">{key.split('-')[0]} - {state.percentage}%</p>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1">
                <div style={{ width: `${state.percentage}%` }} className="h-full bg-blue-500 rounded-full transition-all" />
              </div>
            </div>
          )
        ))}
      </div>

      <div
        onClick={() => fileinputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragActive(false); console.log(e.dataTransfer.files, "-->e.datafiles", e, "-->whole"); handleUpload(Array.from(e.dataTransfer.files)); }}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition ${isDragActive ? 'border-blue-600 bg-blue-50' :
          'border-slate-700 bg-[#080b11]'}`}
      >
        <p className="font-mono text-xs text-slate-400">Drag & drop or click to upload</p>
      </div>
      <input ref={fileinputRef} type="file" multiple hidden onChange={(e) => { e.target.files && handleUpload(Array.from(e.target.files)); console.log(e.target.files, "-->e.datafiles", e, "-->whole"); }} />

      <div className="bg-[#0e121b] border border-slate-800 rounded-xl p-3 shadow-sm">
        <h3 className="font-mono text-[10px] font-bold uppercase text-slate-500 mb-2">ROOM CACHE ({filesArray.length})</h3>
        <div className="space-y-2">
          {filesArray.map((f) => (
            <div key={f.id} className="flex items-center justify-between bg-[#080b11] border border-slate-800 rounded-lg p-2 gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="p-1.5 bg-slate-900 border border-slate-800 rounded">{getFileIcon(f.type)}</div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs text-slate-200 truncate">{f.name}</p>
                  <p className="text-[10px] font-mono text-slate-500">{f.sender} • {formatSize(f.size)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1.5 hover:bg-slate-800 text-slate-400 rounded"><Eye className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDownload(f.id, f.name)} className="p-1.5 hover:bg-slate-800 text-cyan-400 rounded">
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div >
  );
};

export default Filesharing;


// git add 