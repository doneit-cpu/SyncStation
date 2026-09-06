import { useEffect, useRef, useState, } from 'react';
import { useSync } from '../context/syncontext';
import { PeerManger } from '../services/peerManger';

const Liveaduio = () => {
  const { socket, setalert } = useSync();
  const peerManger = useRef(new PeerManger());
  const broadcasterid = useRef("");
  const [hasbroadcast, sethadbroadcast] = useState(false);
  const streamedata = useRef<MediaStream | null>(null);
  const [volume, setvolume] = useState(0);

  const liveAudioRef = useRef<HTMLAudioElement>(null);

  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        console.log('Screen Wake Lock is active!');
      }
    } catch (err) {
      console.error(`Wake Lock failed: ${err}`);
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
      console.log('Screen Wake Lock released.');
    }
  };

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
      requestWakeLock();
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

    socket.on("live-closed", () => {
      setalert({ "message": "broadcaster has closed the live audio streaming", "type": "warning" })
      peerManger.current.destroyAll()
      broadcasterid.current = "";
      sethadbroadcast(false);
      releaseWakeLock()
    })

    return () => {
      socket.off("live-started");
      socket.off("live-signal");
      socket.off("live-answer-signal");
      socket.off("live-closed");
      releaseWakeLock()
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

    releaseWakeLock()

    if (!broadcasterid.current) {
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
          <>
            <button onClick={() => {
              requestWakeLock()
              handlejoined()
            }
            }>Reciver-node</button>
            <button onClick={() => {
              if (liveAudioRef.current) {
                liveAudioRef.current.pause()
              }
            }}>pause</button>
            <input type='range' min={0} max={100} value={volume}
              onChange={(e) => {

                if (liveAudioRef.current) {
                  const newdata = parseFloat(e.target.value);
                  liveAudioRef.current.volume = newdata / 100;
                  setvolume(newdata);
                }
              }}></input>
          </>

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



// git log 
