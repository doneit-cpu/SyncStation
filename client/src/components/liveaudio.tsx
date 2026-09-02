import { useEffect, useRef, useState, } from 'react';
import { useSync } from '../context/syncontext';
import { PeerManger } from '../services/peerManger';

const Liveaduio = () => {
  const { socket, setalert } = useSync();
  const peerManger = useRef(new PeerManger());
  const broadcasterid = useRef("");
  const [hasbroadcast, sethadbroadcast] = useState(false);
  const streamedata = useRef<MediaStream | null>(null);

  const liveAudioRef = useRef<HTMLAudioElement>(null);

  const handlesystemaudio = async () => {
    if (!broadcasterid.current) {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: {
          suppressLocalAudioPlayback: false,
        },
        systemAudio: "include",
        surfaceSwitching: "include",
      } as any);

      if (stream.getAudioTracks().length === 0) {
        alert("No audio found. Did you check 'Share System Audio'?");
        return;
      }
      const audioOnlyStream = new MediaStream(stream.getAudioTracks());
      streamedata.current = audioOnlyStream;
      // streamedata.current = stream;
      socket.emit("live-start");
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("live-started", (data: string) => {
      if (data !== socket.id) {
        broadcasterid.current = data;
        sethadbroadcast(true);
        console.log("we send got it ", data);
      }
    })

    socket.on("live-signal", (id: string, signal: any) => {
      if (!streamedata.current) return;
      let peer = peerManger.current.getPeer(id);
      if (!peer) {
        peer = peerManger.current.createPeer(id, false, streamedata.current, (signal) => {  //
          socket.emit("live-answer-signal", id, signal);
        })
      }
      peer.signal(signal); // lister is connected broadcaster
      console.log("we got broadcaster connected here ");
    });
    
    socket.on("live-answer-signal", (signal: any) => {
      const peer = peerManger.current.getPeer(broadcasterid.current);
      if (!peer) {
        setalert({ "message": "we having issue at webrtc connection", "type": "error" });
        return;
      };
      peer!.signal(signal);
      console.log("whole thing is done");
    })
    
    socket.on("live-closed",()=>{
      setalert({"message":"broadcaster has closed the live audio streaming","type":"warning"})
      peerManger.current.destroyAll()
      broadcasterid.current="";
    })

    return () => {
      socket.off("live-started");
      socket.off("live-signal");
      socket.off("live-answer-signal");
      socket.off("live-closed");
    }

  }, [socket])

  const handlejoined = () => {
    if (!socket || !broadcasterid.current || peerManger.current.getPeer(broadcasterid.current)) {
      console.log('we got problem somehow?')
      return;
    }

    console.log("we send every request to join");
    const peer = peerManger.current.createPeer(broadcasterid.current, true, null, (signal) => {
      socket.emit("live-signal", broadcasterid.current, signal)
    })
    peer.on("stream", (remotestreamaudio) => {
       if (liveAudioRef.current) {
        liveAudioRef.current.srcObject = remotestreamaudio;
        liveAudioRef.current.play().catch(e => console.error("Play failed:", e));
      }
    })

  }

  const closebroadcaster = () => {
   
    if(!broadcasterid){
      socket.emit("live-close");
    }

    if (streamedata.current) {
      streamedata.current.getTracks().forEach(track => track.stop());
      streamedata.current = null;
    }
  
    peerManger.current.destroyAll();

    broadcasterid.current = "";
    sethadbroadcast(false);

    console.log("Broadcast closed");
  }

  return (
    <>

      <div>
        <button onClick={() => handlesystemaudio()}>Host-node</button>
        {hasbroadcast &&
          <button onClick={() => handlejoined()}>Reciver-node</button>
        }
        {
          hasbroadcast && 
        <button onClick={() => closebroadcaster()}>Close-Broadcast</button>
        }
        <audio ref={liveAudioRef} autoPlay playsInline controls style={{ display: 'block' }}></audio>
      </div>

    </>
  )
}

export default Liveaduio;
