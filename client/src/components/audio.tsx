/// first send the user all song file if they want to play like list ? okay , now two things if want hear do alone if not do it broadcast it 
// other cool thing getDisplayMedia() can give u whole ? audio from all pc like chrome tab to vlc or any other video (decoder) player 


import {useState } from 'react'
import { useSync } from '../context/syncontext'

interface playlist{
  id:string;
  filename:string;
}

const Audio = () => {

  const { socket , fileshareMap } =useSync();
  const [songlist,setsonglist]=useState<playlist[]>([]); 
  const arraylist=Array.from(fileshareMap);

  const audiofilelist=(files:)=>{
    files.filter((file)=>{
      if(file.type==".mp3" || ".acc" || ".m4a" || ".wav" || ".flac"){
        setsonglist((prev)=>[...prev,(file.id,file.name)])
      }
    })
  }
  audiofilelist(fileshareMap);
  return (
    <div>
      
    </div>
  )
}

export default Audio


// id , nameoffile , 

// //<!-- HTML -->
// <audio id="myAudio" src="your-sound-file.mp3"></audio>
// <button onclick="playAtTime(10)">Play at 10 seconds</button>

// <script>
//   // JavaScript
//   function playAtTime(seconds) {
//     const audio = document.getElementById('myAudio');
//     audio.currentTime = seconds; 
//     audio.play();
//   }
// </script>


// // Finds the first video or audio element on the page
// const media = document.querySelector('video') || document.querySelector('audio');

// if (media) {
//     console.log(`Current Time (seconds): ${media.currentTime}`);
    
//     // Formatted as MM:SS
//     const minutes = Math.floor(media.currentTime / 60);
//     const seconds = Math.floor(media.currentTime % 60).toString().padStart(2, '0');
//     console.log(`Formatted Time: ${minutes}:${seconds}`);
// } else {
//     console.log("No media element found on this page.");
// }
