// how i get content from backend which has no db , just live data by socketio from the server ? so how , i need to give data to t_content
// we need to gather data and if possible make json , or object , and gather info ? don't where i gather info ? '' done 
// i need to make user name and room code gen ,well username person give but be check by broswer 
//  only one person made ther fucking room code and then share , it ,also if u want to make one then u should check if person is not join in any group or anything okay , 
// both after the whatever room would need render the page ? without dobout thingk about it 

import Inputtext from "./components/inputtext.tsx"
import Clipboardy from "../src/components/clipboard.tsx"
import Sharedroominfo from "./components/sharedroominfo.tsx"
import { useSync } from "./context/syncontext.tsx"
import { useEffect } from "react"
import Sandbox from "./pages/sandbox.tsx"
import Home  from "./pages/home.tsx"

const App = () => {

  const { createroom, shared, setroom, aler, setaler, socket ,linkjoinreq } = useSync();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomcode = params.get('room');
    if (roomcode) {
      setroom(roomcode);
      console.log("inside qr code processing");
      linkjoinreq(roomcode);

    }
  }, [])



  return (
    <>
      {/* < Inputtext content='Username' ></Inputtext>
      <span>
        <button onClick={() => { socket.connect() }} >connect</button>
      </span>
      <button onClick={() => { createroom()}}> Create the room </button>
      {aler && <Inputtext content='Room-code' />}
      <button onClick={() => { setaler(true) }}> join the room </button>
      {shared && < Sharedroominfo sharedcontect='Room Code'></Sharedroominfo>}
      <Clipboardy /> */}
      <Home/>      
    </>
  )
}

export default App;
