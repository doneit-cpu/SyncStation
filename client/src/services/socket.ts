import { io } from "socket.io-client"
import { getDeviceInfo } from "./utlis.ts";
import type { Clientinfo } from "../../../shared/types.ts"  // add type when only sharing for type of thing 

export const socket = io({   // we don't need to share or put link here bcs this going host in same port server and client so no worries 
  autoConnect: false,
});

export function connect() {
  socket.connect(); // os , device name , broweser , app , uesername ;
}

// export function reqjoing(roomName: string, username: string) {
//   console.log("3")
//   socket.emit("pre-joinreq", roomName, username) //make event name for room exist or not ,
// }

export function reqjoing(roomName: string, username: string){
  console.log("3")
  socket.emit("pre-joinreq",roomName,username) //make event name for room exist or not ,
}
export function joining(roomName: string, username: string) {
  const { os, device } = getDeviceInfo();

  const myInfo: Clientinfo = {
    user: username,
    room: roomName,
    os: os,
    device: device
  };
  console.log("6")
  socket.emit("join-room", myInfo);
}

export function Send(data: string, room: string) {
  // send data client to server   
  console.log("data send from the first node , socket.io")
  socket.emit("Syc-msgS", data, room);

}

