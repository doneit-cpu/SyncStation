import type { ChangeEvent, DragEvent } from 'react'
import { useState, useRef } from 'react';
import { FileText, Image as ImageIcon, Music, FileCode, Archive, Eye, Download } from 'lucide-react';
import axios from 'axios';

import type { Fileinfo } from '../services/utlis.ts';
import { useSync } from '../context/syncontext';

interface UploadProgress {
  percentage: number;
  speed: string;
  timeRemaining: string;
  status: 'uploading' | 'completed' | 'failed';
}

const Filesharing = () => {
  const { Lanip, setalert, username, fileshareMap } = useSync();
  const filesArray = Array.from<Fileinfo>(fileshareMap.values());
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadstate, setuploadstate] = useState<Record<string, UploadProgress>>({});
  const fileinputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: File[]) => {
    if (files.length === 0) {
      setalert({ message: "Please select a file first", type: "warning" });
      return;
    }

    for (const file of files) {
      const formdata = new FormData();
      formdata.append('Files', file);
      formdata.append('Username', username);
      formdata.append('Lanip', Lanip);
      formdata.append('Mata', JSON.stringify({ name: file.name, size: file.size, type: file.type }));

      const fileKey = `${file.name}-${file.size}`;
      const startTime = Date.now();

      setuploadstate(prev => ({ ...prev, [fileKey]: { percentage: 0, speed: '0 KB/s', timeRemaining: '', status: 'uploading' } }));

      try {
        await axios.post(`http://${Lanip}:3000/api/files/uploads`, formdata, {
          onUploadProgress: (ProgressEvent) => {
            const { loaded, total } = ProgressEvent;
            if (!total) return;

            const currentPercent = Math.floor((loaded * 100) / total);
            const totalTimeSeconds = (Date.now() - startTime) / 1000;
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
        onDrop={(e) => { e.preventDefault(); setIsDragActive(false); handleUpload(Array.from(e.dataTransfer.files)); }}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition ${isDragActive ? 'border-blue-600 bg-blue-50' :
          'border-slate-700 bg-[#080b11]'}`}
      >
        <p className="font-mono text-xs text-slate-400">Drag & drop or click to upload</p>
      </div>
      <input ref={fileinputRef} type="file" multiple hidden onChange={(e) => e.target.files && handleUpload(Array.from(e.target.files))} />

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
                <a href={f.downloadlink} download={f.name} className="p-1.5 hover:bg-slate-800 text-cyan-400 rounded"><Download className="w-3.5 h-3.5"
                /></a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Filesharing;