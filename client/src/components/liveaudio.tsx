import { useEffect, useRef, useState } from 'react';
import { useSync } from '../context/syncontext';
import { PeerManger } from '../services/peerManger';

const Liveaduio = () => {
  const { socket } = useSync();
  const peerManger = useRef(new PeerManger());
  const [broadcasterid, setbroadcasterid] = useState("");
  const streamedata = useRef<MediaStream | null>(null);

  const liveAudioRef = useRef<HTMLAudioElement>(null);

  const handlesystemaudio = async () => {
    if (!broadcasterid) {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: {
          suppressLocalAudioPlayback: false,
        },
        systemAudio: "include",
        surfaceSwitching: "include",
      } as any);

      console.log("BROADCASTER DEBUG:");
      console.log("- Stream active:", stream.active);
      console.log("- Audio tracks:", stream.getAudioTracks().length);

      if (stream.getAudioTracks().length === 0) {
        console.error("❌ NO AUDIO DATA FOUND! Did you check the 'Share Audio' box?");
      }

      streamedata.current = stream;
      socket.emit("live-start");
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("live-started", (data: string) => {
      if (data !== socket.id) {
        setbroadcasterid(data);
        console.log("we send got it ", data);
      }
    })

    socket.on("live-signal", (id: string, signal: any) => {
      if (peerManger.current.getPeer(id) || !streamedata.current || broadcasterid) return;
      const peer = peerManger.current.createPeer(id, false, streamedata.current, (signal) => {  //
        socket.emit("live-answer-signal", id, signal);
      })
      peer.signal(signal); // lister is connected broadcaster
      console.log("we got broadcaster connected here ");
    });

    socket.on("live-answer-signal", (signal: any) => {

      const peer = peerManger.current.getPeer(broadcasterid);
      if (!peer) {
        console.log("we fucked don't know y ", peer, broadcasterid);
        return;
      };


      peer.signal(signal);
      console.log("whole thing is done");
    })

    return () => {
      socket.off("live-started");
      socket.off("live-signal");
      socket.off("live-answer-signal");
    }

  }, [broadcasterid])

  const handlejoined = () => {
    if (!socket || !broadcasterid || peerManger.current.getPeer(broadcasterid)) {
      console.log('we got problem somehow?')
      return;
    }

    console.log("we send every request to join");
    const peer = peerManger.current.createPeer(broadcasterid, true, null, (signal) => {
      socket.emit("live-signal", broadcasterid, signal)
    })
    peer!.on("stream", (remotestreamaudio) => {
      if (liveAudioRef.current) {
        liveAudioRef.current.srcObject = remotestreamaudio;
        liveAudioRef.current.play().then(() => {
          console.log("Audio playback started successfully!");
        });
      }
    })

  }

  return (
    <>

      <div>
        <button onClick={() => handlesystemaudio()}>Host-node</button>
        <button onClick={() => handlejoined()}>Reciver-node</button>
        <audio ref={liveAudioRef} autoPlay playsInline controls style={{ display: 'block' }}></audio>
      </div>

    </>
  )

}

export default Liveaduio;

