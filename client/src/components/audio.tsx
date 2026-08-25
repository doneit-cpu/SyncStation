/// first send the user all song file if they want to play like list ? okay , now two things if want hear do alone if not do it broadcast it 
// other cool thing getDisplayMedia() can give u whole ? audio from all pc like chrome tab to vlc or any other video (decoder) player 

import { useEffect, useRef } from 'react'
import { useSync } from '../context/syncontext'
import type { Fileinfo, audiocontrol } from "../services/utlis"
import { audiosend, syncontinous } from "../services/socket"

interface playlist {
  id: string;
  filename: string;
  displayname: string;
}

const Audio = () => {

  const { fileshareMap, username, room, selectitem, setselecteitem, socket, isplay, setisplay, song, setsong, setalert, filename, setfilename } = useSync();

  const arraylist = Array.from<Fileinfo>(fileshareMap.values());

  const audioRef = useRef<HTMLAudioElement>(null);
  const selecitemRef = useRef(selectitem);
  const clockdrift = useRef(0);   // what i put here ? 
  const fname = useRef(filename);
  const driftIntervalRef = useRef<number | null>(null);

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

  useEffect(() => {
    selecitemRef.current = selectitem;
  }, [selectitem])

  useEffect(() => {
    if (!socket) return;

    if (song) { syncontinous() };

    socket.on("center-clock-R", (clinetclock: number, serverclock: number) => {
      const clientnow = Date.now();
      const latency = (clientnow - clinetclock) / 2; // latency // time taken between server and client
      const estimatedserverclock = serverclock + latency;
      const clockoffset = estimatedserverclock - clinetclock;
      clockdrift.current = clockoffset;
    })

    let loaded: number = 0;
    socket.on("done-audio", (data: audiocontrol) => {

      console.log("end of the audio syc");

      if (data.sender == username) return;

      setsong(true);

      if (selecitemRef.current != data.id) {
        selecitemRef.current = data.id;
        fname.current = data.name;
      }

      const waitMs = Math.max(0, data.synctime - clockdrift.current - Date.now());

      if (!audioRef.current) {
        setalert({ message: "Something went wrong with audio cast", type: "error" })
      }

      if (driftIntervalRef.current) {
        clearInterval(driftIntervalRef.current);
      }


      setTimeout(() => {
        audioRef.current!.currentTime = data.timestamp;
        setisplay(data.play);
        if (data.play) {
          audioRef.current!.play();
          loaded = Date.now() - (data.timestamp * 1000);
        } else {
          audioRef.current!.pause();
        }
      }, waitMs);

    })

    driftIntervalRef.current = setInterval(() => {
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


    return () => {
      socket.off("done-audio");
    }
  }, [username, selectitem, song]
  )

  const playatTime = (seconds: number, pause: boolean, delay: number) => {
    console.log("first step of sync audio cast", seconds, pause, delay);
    if (!audioRef.current) return;

    const playingtime = audioRef.current?.currentTime;
    const newTime = playingtime + seconds;
    audioRef.current.currentTime = newTime;

    const data: audiocontrol = {    //i had collected data to data
      id: selectitem,
      name: filename,
      play: pause,
      timestamp: newTime,
      synctime: Date.now() + delay + clockdrift.current,
      sender: username,
    }

    audiosend(data, room);

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
            <audio hidden ref={audioRef} src={`uploads/${selectitem}`}></audio>
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
                playatTime(0, true, 500)
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


