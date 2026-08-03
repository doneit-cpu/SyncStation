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

  // Functions to manipulate state
  const addToHistory = (newContent: string) => {
    setHistory((prev) => [...prev, newContent]);
  };

  useEffect(() => {

    socket.on("Syc-msgC", (data: string) => {  // take data from server 
      // way to find way put data into the device weather pc or phone 
      addToHistory(data);
    })

    return () => {
      socket.off('Syc-msgC')
    };

  }, [])


  const creatroom = () => {
    const code = genRoomcode();
    joining(code, username);
    setroom(code);
    setshared(true);
  }

  const joingreq = () => {
    reqjoing(room, username);
  }

  return (
    <SyncContext.Provider value={{ username, setUsername, history, addToHistory, creatroom, joingreq, shared, setshared, room, setroom, aler, setaler , socket }}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => useContext(SyncContext)
