/// first send the user all song file if they want to play like list ? okay , now two things if want hear do alone if not do it broadcast it 
// other cool thing getDisplayMedia() can give u whole ? audio from all pc like chrome tab to vlc or any other video (decoder) player 

import { useEffect, useRef, useState } from 'react'
import { useSync } from '../context/syncontext'
import type { Fileinfo, audiocontrol } from "../services/utlis"
import { audiosend, syncontinous } from "../services/socket.ts"
import Liveaduio from './liveaudio.tsx'

interface playlist {
  id: string;
  filename: string;
  displayname: string;
}

const Audio = () => {

  const { fileshareMap, username, room, socket, isplay, setisplay, song, setsong, setalert} = useSync();

  const arraylist = Array.from<Fileinfo>(fileshareMap.values());

  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lastid, setlastid] = useState("");
  const selectemRef = useRef("");
  const filename = useRef("");
  const clockdrift = useRef(0);   // what i put here ? 
  const driftIntervalRef = useRef<NodeJS.Timeout>(null);

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

  // useEffect(() => {
  //   selecitemRef.current = selectitem;
  // }, [selectitem])

  useEffect(() => {
    if (!socket) return;
    console.log("-1-a")
    if (song) { syncontinous() };
    console.log("-2-a")

    socket.on("center-clock-R", (clinetclock: number, serverclock: number) => {
      console.log("start-clock-3", clinetclock, serverclock);
      const clientnow = Date.now();
      const latency = (clientnow - clinetclock) / 2; // latency // time taken between server and client
      const estimatedserverclock = serverclock + latency;
      const clockoffset = estimatedserverclock - clinetclock;
      clockdrift.current = clockoffset;
    })
    console.log("-3-a")

    let loaded: number = 0;
    socket.on("done-audio", (data: audiocontrol) => {
      console.log("-4-a")

      console.log("godgod-zap-songdetailsend by other", data);

      setsong(true);

      audioRef.current!.src = `/uploads/${data.id}`;

      if (audioRef.current && data.id != lastid) {
        audioRef.current.load();
        setlastid(data.id);
      }

      const waitMs = Math.max(0, data.synctime - clockdrift.current - Date.now());

      if (!audioRef.current) {
        console.log("-5-a")
        setalert({ message: "Something went wrong with audio cast", type: "error" })
      }

      if (driftIntervalRef.current) {
        clearInterval(driftIntervalRef.current);
      }

      setTimeout(() => {
        console.log("we are in the waiting time of playing song", selectemRef.current, waitMs);
        audioRef.current!.currentTime = data.timestamp;
        setisplay(data.play);
        if (data.play) {
          audioRef.current!.play();
          loaded = Date.now() - (data.timestamp * 1000);
          if (audioRef.current?.error) {
            console.log("no non no", audioRef.current.error)
          }
        } else {
          audioRef.current!.pause();
        }
      }, waitMs);


      driftIntervalRef.current = setInterval(() => {
        console.log(audioRef.current);
        const playedpart = (Date.now() - loaded) / 1000;
        const diff = audioRef.current?.currentTime! - playedpart;

        if (diff < -0.04) {
          // Behind by more than 40ms -> speed up slightly
          audioRef.current!.playbackRate = 1.04;
        } else if (diff > 0.04) {
          // Ahead by more than 40ms -> slow down slightly
          audioRef.current!.playbackRate = 0.96;
        } else {
          // In diff!
          audioRef.current!.playbackRate = 1.0;
        }
      }, 10000);
    })

    return () => {
      socket.off("done-audio");
    }
  }, [username, song, lastid]
  )

  const playatTime = (seconds: number, pause: boolean, delay: number) => {
    console.log("first step of sync audio cast", seconds, pause, delay);
    if (!audioRef.current) return;

    const playingtime = audioRef.current?.currentTime;
    const newTime = playingtime + seconds;
    audioRef.current.currentTime = newTime;

    const data: audiocontrol = {    //i had collected data to data
      id: selectemRef.current,
      name: filename.current,
      play: pause,
      timestamp: newTime,
      synctime: Date.now() + delay + clockdrift.current,
      sender: username,
    }
    console.log("package send by me  ---- ", data);
    audiosend(data, room);

  }


  return (
    <div className="mainaudio">
      <div className='secondlayer'><h1>Audio Bridge</h1>
        <button onClick={() => { setsong(true) }} >AUDIO CAST</button>
        <button onClick={() => { }}>live audio</button>
      </div>
      {song &&
        <div className='songlist'>
          <div className='rightplaycontrol'>
            <h2>{`Song playing is :${filename.current}`}</h2>
            <audio hidden ref={audioRef}
              onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)} ></audio>
            <input
              type="range"
              min="0"
              max={duration}
              value={progress}
              onChange={(e) => {
                const newTime = parseFloat(e.target.value);
                audioRef.current!.currentTime = newTime; // Seek                                                                                                
                setProgress(newTime); // Update UI immediately                                                                                                  
              }}
            />
            <span>{(progress*1000).toFixed(0)}</span>
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
                selectemRef.current = f.id;
                filename.current = f.filename;
                playatTime(0, true, 500)
              }}
              >{`${f.filename} ${f.displayname}`}
              </div>
            ))}
          </div>
        </div>
      }
      {(!song) &&
        <Liveaduio></Liveaduio>  
      }
    </div>
  )
}

export default Audio

// git 
