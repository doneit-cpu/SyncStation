  import { useEffect, useRef, useState } from 'react';
  import { useSync } from '../context/syncontext';
  import { PeerManger } from '../services/peerManger';

  const liveaduio = () => {
    const { socket, broadcasterid } = useSync();
    const [live, setlive] = useState(false);
    const peerManger = useRef(new PeerManger());
    const streamedata = useRef<MediaStream | null>(null);// what type this would can u tell , i tried to htmlmediadata but that don't worked 

    const liveAudioRef = useRef<HTMLAudioElement>(null);
    const handlesystemaudio = async () => {
      if (!broadcasterid.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setlive(true);
        streamedata.current = stream;
        socket.emit("broadcaster-L"); 
      } else {
        socket.emit("revicer-L", broadcasterid.current);
        console.log("We already have host");
        return;
      }
    };

    useEffect(() => {
      if (!socket) return;

      socket.on("signal-answer", (id:string,signal:any) => {
        const peer = peerManger.current.peers.get(id);
        if (peer) peer.signal(signal);
      });

      socket.on("sender-live", (livehostid: string) => {    // this sender okay webrtc node
        peerManger.current.createPeer(livehostid, true, streamedata.current, (signal) => {
          socket.emit("signal-answer", livehostid, signal)
          broadcasterid.current = socket.id;
        })
      })

      socket.on("reciver-live", (liveclientid: string) => {    
        const peer = peerManger.current.createPeer(liveclientid, false, null, (signal) => {
          socket.emit("signal-answer", liveclientid, signal)
        })

      
        peer.on("stream", (remotestreamaudio) => {
          if (liveAudioRef.current) {
            liveAudioRef.current.srcObject = remotestreamaudio;
            liveAudioRef.current.play();
          }
        })

        socket.on("signal-answer", (id: string, signal: any) => {

        })

      })

      return () => {
        socket.off("sender-live");
        socket.off("reciver-live");
        socket.off("signal-answer");
      }

    }, [])


    return (
      <div>
        <button onClick={() => handlesystemaudio()}></button>
        <audio hidden ref={liveAudioRef} ></audio>
      </div>
    )

  }

  export default liveaduio;