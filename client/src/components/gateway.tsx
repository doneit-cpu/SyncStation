import { useSync } from "../context/syncontext.tsx"
import "./gateway.css"


const Gateway = () => {
  const { createroom, joingreq ,setusername,username,setroom,room} = useSync();

  return (
    <div className='gateway-card'>
      <h3>PAIRING GATEWAY</h3>
      <h2>Connect your device</h2>
      <div>
        <label><h6>DEVICE NAME</h6></label>
        <input type='text' value={username} placeholder="Guest-4353" 
        onChange={(e)=>{setusername(e.target.value)}} ></input>
      </div>

      <div className='pairing-grid' >
        <div className='box'>
          <h4 >HOST MODE</h4>
           <p>Open a new room..</p>
          <div className="w-mx h-max">
          
          <button className="button-gateway" onClick={createroom}> HOST NEW ROOM </button>
          </div>
         
        </div>

        <div className='box'>
          <h4>JOIN MODE</h4>
          <p> Enter an existing room</p>
          <label><h6>ROOM CODE</h6></label>
          <input type='text' value={room} placeholder='R.F FJ90' onChange={(e)=>{setroom(e.target.value)}} />
          <button className="button-gateway" onClick={() => {console.log("nothing")} } ><h5>SCAN OR WITH CAEMERA</h5></button>
          <button className="button-gateway" onClick={joingreq} > JOIN ROOM </button>
        </div>
      </div>
       <p className="footer-note">Ephemeral RAM rooms. Nothing is stored in the cloud.</p>
    </div>
  )
}

export default Gateway
