import "/home/godz/Desktop/Reactfast/SyncStation/client/src/components/sharedroom.css";
import { useSync } from "../context/syncontext";

interface Props {
  sharedcontect: string | "sharing info"
  // we need find how to make room code copylink which send to my side , and qr code
}
 

const Sharedroominfo = ({ sharedcontect }: Props) => {
  
  const {setshared , room} = useSync();
  //how to make link for this room where with just clicked u can get joined into room

    const copyCode = async ()=> {
    await navigator.clipboard.writeText(room);
    console.log(room);
  }
  
  const copyLink=()=>{

  }
  
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2> {sharedcontect}!</h2>

        <p><strong>Room Code:</strong> {room}</p>

        <button onClick={copyCode}>
          Copy Code
        </button>

        <p><strong>Invite Link:</strong></p>

        <input
          value={"copylink"} // display link here ,
          readOnly
        />

        <button onClick={copyLink}>
          Copy Link
        </button>

        <button onClick={()=>{setshared(false)}}>
          Close
        </button>
      </div>
    </div>

  )
}

export default Sharedroominfo
