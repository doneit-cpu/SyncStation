import { useSync } from "../context/syncontext.tsx"
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "./gateway.css"

const Gateway = () => {
  
  const { createroom, joingreq, setusername, username, setroom, room, socket, checklan , linkjoinreq } = useSync();
  const navigate = useNavigate();

  const handlecreateroom = async () => {
    socket.connect();
    const success = await createroom();
    if (success) {
      navigate("/main")
    }
  }

  const handlejoinroom = async () => {
    const success = await joingreq();
    if (success) {
      navigate("/main");
    }
  }

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
    <div className='gateway-card'>
      <h3>PAIRING GATEWAY</h3>z
      <h2>Connect your devices</h2>

      <div className="device-name">
        <label><h6>DEVICE NAME</h6></label>
        <div className="input-with-button">
          <input type='text' value={username} placeholder="Guest_3861"
            onChange={(e) => setusername(e.target.value)} />
          <button className="small-button">SAVED</button>
        </div>
      </div>

      <div className='pairing-grid' >
        <div className='box'>
          <h4>HOST MODE</h4>
          <p>Open a new room.<br />Your computer becomes the bridge.</p>
          <button className="button-gateway" onClick={() => { handlecreateroom(); }}>HOST NEW ROOM</button>
        </div>

        <div className='box'>
          <h4>JOIN MODE</h4>
          <p>Enter an existing room<br />using room code or QR.</p>
          <label><h6>ROOM CODE</h6></label>
          <input type='text' value={room} placeholder='E.G. XJ92'
            onChange={(e) => setroom(e.target.value)} />
          <button className="button-gateway secondary" onClick={() => { console.log("scan"), checklan() }}>SCAN QR WITH CAMERA</button>
          <button className="button-gateway" onClick={() => { handlejoinroom() }}>JOIN ROOM</button>
        </div>
      </div>

      <p className="footer-note">✓ Ephemeral RAM rooms. Nothing is stored in the cloud.</p>
    </div>
  )
}

export default Gateway
