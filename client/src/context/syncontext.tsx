import React, { createContext, useContext, useEffect, useState } from 'react';
import { joining, socket, reqjoing } from '../services/socket.ts';
import { genRoomcode } from '../services/utlis.ts';

const SyncContext = createContext<any>(null);

export const SyncProvider = ({ children }: { children: React.ReactNode }) => {
  // All your state "lives" here
  const [username, setUsername] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [shared, setshared] = useState(false);
  const [room, setroom] = useState("");
  const [aler, setaler] = useState(false);
  // const [problem, setproblem] = useState("");

  // Functions to manipulate state
  const addToHistory = (newContent: string) => {
    setHistory((prev) => [...prev, newContent]);
  };

  useEffect(() => {

    socket.on("connect", () => {
      console.log("Connected to server!");
    });

    socket.on("Syc-msgC", (data: string) => {  // take data from server 
      // way to find way put data into the device weather pc or phone 
      console.log("something has come",data);
      addToHistory(data);
    })

    socket.on("done-joinreq", (roomName: string, uesername: string, ans: boolean) => {
      console.log("5",ans);
      if (ans) {
        joining(roomName, uesername);
      } else {    // write code throw error or something that show user something went wrong ,
        // setproblem(thing so just here ) // i done this can help me 
        console.log("error bro find some glass then write roomcode  again ")
      }
      // my question thta i had put this into else or just leave it ?   //i'm making 
      //set(!boolean) assuming the boolean will be flase and then we will take one and pls enter vaild code or anything  
      // make variable show that we are not having this room try again 
    })

    socket.on("connect_error", (err) => {
      console.error("Connection Error:", err.message);
      alert("Connection to server failed. Please check your internet or try again later.");
    });

    socket.on("disconnect", (reason) => {
      console.log("Disconnected:", reason);
    });

    return () => {
      socket.off('Syc-msgC');
      socket.off('done-joinreq');
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
    };

  }, [])


  const createroom = () => {
    console.log("1")
    const code = genRoomcode();
    joining(code, username);
    setroom(code);
    setshared(true);
  }

  const joingreq = () => {
    console.log("2")
    reqjoing(room, username);
  }


  const linkjoinreq = (newroomcode: string) => {
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
    <SyncContext.Provider value={{ username, setUsername, history, addToHistory, createroom, joingreq, shared, setshared, room, setroom, aler, setaler, socket, linkjoinreq }}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => useContext(SyncContext)
