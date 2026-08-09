import type { ChangeEvent, FormEvent } from 'react'
import { useState } from 'react';
import { useSync } from '../context/syncontext';
import type { Fileinfo } from '../services/utlis.ts';

const filesharing = () => {

  const { Lanip, setalert, username ,fileshareMap , lannet , checklan} = useSync();
  const filesArray=Array.from<Fileinfo>(fileshareMap.values())
  const [file, setfile] = useState<File | null>(null);

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault() // this stop browring from reloding 

    if (!file) {
      setalert({ message: "Please select a file first", type: "warning" })
      return
    };

    const formdata = new FormData();
    formdata.append('Files', file);
    formdata.append('Username', username);
    formdata.append('Lanip', Lanip);
    formdata.append('Mata', JSON.stringify({ name: file.name, size: file.size, type: file.type }))
    try {
      const response = await fetch(`http://${Lanip}:3000/api/files/uploads`, {
        method: "POST",
        body: formdata
      })

      if (response.ok) {
        setalert({ message: "Upload successful!", type: "success" })
      } else {
        setalert({ message: "Upload failed!", type: "error" })
      }
    } catch (error) {
      console.log("upload error:", error)
    }

  }

  if(!lannet) checklan();

  return (

    (lannet && <div>
      <form onSubmit={handleUpload}>
        <input type="file" onChange={(e: ChangeEvent<HTMLInputElement>) => setfile(e.target.files?.[0] || null)} />
        <button type="submit" >upload</button>
      </form>
      <ul>
        {filesArray.map((f)=>(
          <li key={f.id}>
            {f.name}-<a href={f.downloadlink} download={f.name}>Download</a>
          </li>
        ))}
      </ul>
    </div>)
  )
}

export default filesharing
