/// first send the user all song file if they want to play like list ? okay , now two things if want hear do alone if not do it broadcast it 
// other cool thing getDisplayMedia() can give u whole ? audio from all pc like chrome tab to vlc or any other video (decoder) player 

import { useRef, useState } from 'react'
import { useSync } from '../context/syncontext'
import type { Fileinfo, audiocontrol } from "../services/utlis"
import { audiosend } from "../services/socket"

interface playlist {
  id: string;
  filename: string;
  displayname: string;
}

const Audio = () => {

  const { fileshareMap, username, room, selectitem, setselecteitem, stop, setstop, song, setsong, currentTime, setcurrentTime, wait ,setwait } = useSync();

  const arraylist = Array.from<Fileinfo>(fileshareMap.values());
  const audioRef = useRef<HTMLAudioElement>(null);

  const audiofilelist: playlist[] = arraylist
    .filter((file) => {
      const extenstions = [".mp3", ".aac", ".m4a", ".wav", ".flac"]
      return extenstions.includes(file.type);
    })
    .map((file) => {
      return {
        id: file.id,
        filename: file.name,
        displayname: file.sender
      }
    })

  const playatTime = (seconds: number, pause: boolean) => {
    if (!audioRef.current) return;
    const playingtime = audioRef.current?.currentTime;
    audioRef.current.currentTime = playingtime + seconds;
    setcurrentTime(playingtime + seconds);  // let wait bit maybe see ur self 
    const data: audiocontrol = {
      id: selectitem,
      name: selectitem.slice(19, -1),
      play: stop,
      timestamp: playingtime + seconds,
      synctime: Date.now() + wait,
      sender: username,
      link: `uploads/${selectitem}`
    }
    audiosend(data, room);
    setInterval(() => {
      if (pause) {
        audioRef.current!.play();
      } else {
        audioRef.current!.pause();
      }
    }, wait);
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
            <h2>{`Song playing is :${selectitem.slice(19, -1)}`}</h2>
            <audio preload="auto" hidden ref={audioRef} src={`uploads/${selectitem}`}
              onCanPlay={() => {
                if (song)
                setstop(true)
                playatTime(0, true);
                setwait(500);
              }}></audio>
            <button className='controlbtn' onClick={() => {
              const see = !stop;
              let lo = "play";
              setstop(see);
              if (see) { playatTime(0, see),setwait(100), lo = "pause" }
              else { playatTime(0, see),setwait(0) }
            }}>{stop ? "PAUSE" : "PLAY"}</button>  // i don;t know how to put play or pause here
            <button className='controlbtn' onClick={() => { playatTime(+5, stop),setwait(150) }}>+5</button>
            <button className='controlbtn' onClick={() => { playatTime(-5, stop),setwait(150) }}>-5</button>
          </div>
          <div className='leftitemlist' >
            {audiofilelist.map((f) => (
              <div key={f.id} onClick={() => {
                setselecteitem(f.id);
                ;
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
