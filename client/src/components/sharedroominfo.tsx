import "./sharedroom.css";
import { useSync } from "../context/syncontext";
import QRCode from "react-qr-code";

interface Props {
  sharedcontect: string | "sharing info"
  // we need find how to make room code copylink which send to my side , and qr code
}
 

const Sharedroominfo = ({ sharedcontect }: Props) => {
  
  const {setshared , room} = useSync();

  const joinLink=window.location.origin+"/?room="+room;
  //how to make link for this room where with just clicked u can get joined into room
  
  const copyLink= async ()=>{
    await navigator.clipboard.writeText(joinLink);
    alert("Link copied!")
  }
  
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2> {sharedcontect}!</h2>

        <p><strong>Room Code:</strong> {room}</p>

        {/* below is qr code made i don't know how */}
        <div style={{background: 'white', padding:'16'}}>
          <QRCode value={joinLink} size={150} />
        </div>

        <p><strong>Invite Link:</strong></p>
        <input value={joinLink} readOnly/>
        <button onClick={copyLink}>Copy Link</button>
        <button onClick={()=>{setshared(false)}}>Close</button>
      </div>
    </div>

  )
}

export default Sharedroominfo
