import React, { createContext, useContext, useEffect, useState } from 'react';
import { joining, socket, reqjoing } from '../services/socket.ts';
import { genRoomcode } from '../services/utlis.ts';

interface AlertType {
  message: string;
  type: 'success' | 'error'| 'warning';
}

const SyncContext = createContext<any>(null);

export const SyncProvider = ({ children }: { children: React.ReactNode }) => {
  // All your state "lives" here
  const [username, setUsername] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [shared, setshared] = useState(false);
  const [room, setroom] = useState("");


  const [alert, setalert] = useState<AlertType | null>(null); // custom alet object for custom alet on site
  // const [problem, setproblem] = useState("");

  // Functions to manipulate state
  const addToHistory = (newContent: string) => {
    setHistory((prev) => [...prev, newContent]);
  };

  useEffect(() => {

    socket.on("connect", () => {
      setalert({message:"Connected successfully.",
        type:"success"
      })
      console.log("Connected to server!");
    });

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
        type: "error"
      });
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
    console.log("2");
    reqjoing(room, username);
  }


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
    <SyncContext.Provider value={{ username, setUsername, history, addToHistory, createroom, joingreq, shared, setshared, room, setroom, socket, linkjoinreq,alert , setalert }}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => useContext(SyncContext)
