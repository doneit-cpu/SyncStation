// how i get content from backend which has no db , just live data by socketio from the server ? so how , i need to give data to t_content
// we need to gather data and if possible make json , or object , and gather info ? don't where i gather info ? '' done 
// i need to make user name and room code gen ,well username person give but be check by broswer 
//  only one person made ther fucking room code and then share , it ,also if u want to make one then u should check if person is not join in any group or anything okay , 

import React from 'react'
import Clipboardy from "../src/components/clipboard.tsx"
import { useState } from 'react'
import { joining, socket } from './services/socket.ts';
import Inputtext from "./components/inputtext.tsx"
import { genRoomcode } from './services/utlis.ts';

export const history: string[] = [];
const rooms = "nene"; // make function that can genrate the uniqe roomcode 

const App = () => {
  const [username, setusername] = useState("");
  const room :string = "roomsdg";
  return (
    <>
      <Inputtext onUsernameChange={setusername} ></Inputtext>
      <span>
        <button onClick={() => { socket.connect() }} >connect</button>
      </span>
      <button onClick={() => { joining(room,username) }}> jion the room </button> 
      <Clipboardy t_content={history} room={rooms}></Clipboardy>
    </>
  )
}

export default App;
