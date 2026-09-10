import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { joining, socket, reqjoing, syncclock } from '../services/socket.ts';
import { getPlatform, isSamelan, genRoomcode } from '../services/utlis.ts';
import type { Fileinfo } from '../services/utlis.ts';

interface AlertType {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

type FileMap = Map<string, Fileinfo>;

const SyncContext = createContext<any>(null);

export const SyncProvider = ({ children }: { children: React.ReactNode }) => {
  // All your state "lives" here
  const [username, setUsername] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [shared, setshared] = useState(false); // removed it maybe 
  const [room, setroom] = useState("");
  const [Lanip, setLanip] = useState("");
  const [platfrom, setplatfrom] = useState("");
  const [lannet, setlannet] = useState(false);
  const [isplay, setisplay] = useState(false);
  const [song, setsong] = useState(false);
  const [filename, setfilename] = useState("");
  const [selectitem, setselecteitem] = useState("");
  const [isconnected, setisconnected] = useState(false);
  const [fileshareMap, setfileshareMap] = useState<FileMap>(new Map());
  const [alertdata, setalert] = useState<AlertType | null>(null); // custom alet object for custom alet on site
  // const [problem, setproblem] = useState("");

  const audioRef = useRef<HTMLAudioElement>(null);
  const centerinterval = useRef<NodeJS.Timeout>(null);
  const loaded = useRef(0);
  const readClipboard=useRef<Promise<void>>(null);
  const broadcasterid = useRef("");
  // Functions to manipulate stat
  const addToHistory = (newContent: string) => {
    setHistory((prev) => [...prev, newContent]);
  };

  useEffect(() => {

    socket.on("connect", () => {
      console.log("Socket connected! Emitting sendip...");
      setisconnected(true);
      setalert({
        message: "Connected successfully.",
        type: "success"
      })
      socket.emit("sendip", true);
      setplatfrom(getPlatform());
      syncclock();
      console.log("Connected to server!");
    });

    socket.on("reciveip", (data) => {
      console.log("got ip0", data)
      setLanip(data);
    })

    socket.on("Syc-msgC", (data: string) => {  // take data from server 
      // way to find way put data into the device weather pc or phone 
      console.log("something has come", data);
      addToHistory(data);
    })

    socket.on("done-joinreq", (roomName: string, uesername: string, ans: boolean) => {
      console.log("5", ans);
      if (ans) {
        setalert({
          message: " You joined the room || Device paired.",
          type: "success"
        })
        joining(roomName, uesername);
      } else {    // write code throw error or something that show user something went wrong ,
        setalert({
          message: "Room-code is invaild Or something went wrong",
          type: "error"
        })
      }
      // my question thta i had put this into else or just leave it ?   //i'm making 
      //set(!boolean) assuming the boolean will be flase and then we will take one and pls enter vaild code or anything  
      // make variable show that we are not having this room try again 
    })

    socket.on("filesharing-ev", (data: Fileinfo) => {
      console.log("we got files");
      setfileshareMap((prevMap) => {        // learn this 
        const newMap = new Map(prevMap);
        newMap.set(data.id, data);
        return newMap;
      });
    })



    socket.on("connect_error", (err) => {
      console.error("Connection Error:", err.message);
      setalert({
        message: "Connection to server failed. Please check your internet or try again later.",
        type: "error"
      });
    });


    socket.on("disconnect", (reason) => {
      setalert({
        message: "We lost u node , i will remember u",
        type: "warning"
      });
      console.log("Disconnected:", reason);
      const timer = setTimeout(() => {
        setisconnected(false);
        setalert(null);
      }, 4 * 60 * 1000);
      clearTimeout(timer);
    });

    // centeral interval for whole app 
    centerinterval.current = setInterval(() => {
      const date = Date.now()

      if (date % (1000 * 60 * 5)) {
        // syncclock()    // sync device clock with server 
      } else if (date % (1000 * 10)) {        
          console.log(audioRef.current);
          const playedpart = (Date.now() - loaded.current) / 1000;
          const diff = audioRef.current?.currentTime! - playedpart;

          if (diff < -0.04) {
            // Behind by more than 40ms -> speed up slightly
            audioRef.current!.playbackRate = 1.04;
          } else if (diff > 0.04) {
            // Ahead by more than 40ms -> slow down slightly
            audioRef.current!.playbackRate = 0.96;
          } else {
            // In diff!
            audioRef.current!.playbackRate = 1.0;
          }
      } else if (date % 500) {

      }


    }, 1000);




    return () => {

      socket.off('Syc-msgC');
      socket.off('done-joinreq');
      socket.off('connect');
      socket.off("reciveip");
      socket.off('connect_error');
      socket.off('disconnect');
      socket.off('filesharing-ev');
    };

  }, [])


  const createroom = async () => {
    try {
      console.log("1")
      const code = genRoomcode();
      console.log(code);
      setroom(code);
      await joining(code, username);
      return true;
    } catch (err) {
      console.error(err);
      setalert({ message: "Something went wrong here , can't Create room", type: 'error' })
      return false;
    }
  }

  const joingreq = async () => {
    console.log("2");
    try {
      await reqjoing(room, username);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  const checklan = async () => {
    console.log("where are having troble ")
    const same = await isSamelan(Lanip);
    setlannet(same);
    if (!same) {
      setalert({
        message: "You're not in the same network as the server, change network settings to access this feature",
        type: "error"
      });
    }
  };


  const linkjoinreq = (newroomcode: string) => {   // work on it pls , we need to work ? 
    if (!socket.connected) {
      socket.connect(); // Ensure we are connected!
    }
    if (username) {
      reqjoing(newroomcode, username);
    } else {
      const tempUser = "Guest_" + Math.floor(Math.random() * 1000);
      setUsername(tempUser);
      reqjoing(newroomcode, tempUser);
    }
  }

  return (
    <SyncContext.Provider value={{ username, setUsername, history, addToHistory, createroom, joingreq, shared, setshared, room, setroom, socket, linkjoinreq, alertdata, setalert, Lanip, platfrom, lannet, checklan, fileshareMap, isconnected, setisconnected, isplay, setisplay, song, setsong, selectitem, setselecteitem, filename, setfilename, broadcasterid, audioRef,readClipboard }}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => useContext(SyncContext)


