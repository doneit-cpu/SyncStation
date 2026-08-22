/// first send the user all song file if they want to play like list ? okay , now two things if want hear do alone if not do it broadcast it 
// other cool thing getDisplayMedia() can give u whole ? audio from all pc like chrome tab to vlc or any other video (decoder) player 

import { useEffect, useRef } from 'react'
import { useSync } from '../context/syncontext'
import type { Fileinfo, audiocontrol } from "../services/utlis"
import { audiosend } from "../services/socket"

interface playlist {
  id: string;
  filename: string;
  displayname: string;
}

const Audio = () => {

  const { fileshareMap, username, room, selectitem, setselecteitem, socket, isplay, setisplay, song, setsong,setalert,filename,setfilename } = useSync();

  const arraylist = Array.from<Fileinfo>(fileshareMap.values());

  const audioRef = useRef<HTMLAudioElement>(null);
  const autoplayRef=useRef(false)
  const selecitemRef=useRef(selectitem);

  const audiofilelist: playlist[] = arraylist
    .filter((file) => {
      const filetype = file.type;

      return filetype.startsWith("audio/");
    })
    .map((file) => {
      return {
        id: file.id,
        filename: file.name,
        displayname: file.sender
      }
    })

  useEffect(()=>{
    selecitemRef.current=selectitem;
  },[selectitem])  

  useEffect(() => {
    if (!socket) return;

    socket.on("done-audio", (data: audiocontrol) => {

      console.log("end of the audio syc");

      if (data.sender == username) return;

      setsong(true);

      if (selecitemRef.current != data.id) {
        setselecteitem(data.id);
      }

      const delay = Math.max(0, data.synctime - Date.now()-30);
      setTimeout(() => {
        if (!audioRef.current) {
          setalert({ message: "Something went wrong with audio cast", type: "error" })
        }
        audioRef.current!.currentTime = data.timestamp;
        setisplay(data.play);
        if (data.play) {
          audioRef.current!.play();
        } else {
          audioRef.current!.pause();
        }
      }, delay);
    })

    return () => {
      socket.off("done-audio");
    }
  }, [username,selectitem]
  )

  const playatTime = (seconds: number, pause: boolean, delay: number) => {
    console.log("first step of sync audio cast",seconds,pause,delay);
    if (!audioRef.current) return;

    const playingtime = audioRef.current?.currentTime;
    const newTime = playingtime + seconds;
    audioRef.current.currentTime = newTime;

    const data: audiocontrol = {    //i had collected data to data
      id: selectitem,
      name: selectitem.slice(19, -1),
      play: pause,
      timestamp: newTime,
      synctime: Date.now() + delay,
      sender: username,
    }
    audiosend(data, room);

    setTimeout(() => {
      if (pause) {
        audioRef.current!.play();
      } else {
        audioRef.current!.pause();
      }
    }, delay);
  }


  return (
    <div className="mainaudio">
      <div className='secondlayer'><h1>Audio Bridge</h1>
        <button onClick={() => { setsong(true) }} >AUDIO CAST</button>
        <button onClick={() => { }}>push to talk</button>
      </div>
      {song &&
        <div className='songlist'>
          <div className='rightplaycontrol'>
            <h2>{`Song playing is :${filename}`}</h2>
            <audio hidden ref={audioRef} src={`uploads/${selectitem}`} onCanPlay={() => {
              if (!autoplayRef.current) return;
              console.log("inside onCanplay")
              autoplayRef.current=false;
              playatTime(0, true, 700)
            }}></audio>
            <button className='controlbtn' onClick={() => {
              const see = !isplay;
              setisplay(see);
              if (see) { playatTime(0, see, 100) }
              else { playatTime(0, see, 100) }
            }}>{isplay ? "PAUSE" : "PLAY"}</button>
            <button className='controlbtn' onClick={() => { playatTime(+5, isplay, 150) }}>+5</button>
            <button className='controlbtn' onClick={() => { playatTime(-5, isplay, 150) }}>-5</button>
          </div>
          <div className='leftitemlist' >
            {audiofilelist.map((f) => (
              <div key={f.id} onClick={() => {
                setselecteitem(f.id);
                setfilename(f.filename);
                autoplayRef.current=(true);
              }}
              >{`${f.filename} ${f.displayname}`}
              </div>
            ))}
          </div>
        </div>
      }
    </div>
  )
}

export default Audio




// git commit