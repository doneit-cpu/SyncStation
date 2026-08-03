import { io } from "socket.io-client"
import { getDeviceInfo } from "./utlis.ts";
import type { Clientinfo } from "../../../shared/types.ts"  // add type when only sharing for type of thing 

export const socket = io( {   // we don't need to share or put link here bcs this going host in same port server and client so no worries 
  autoConnect: false,
});

export function connect() {
  socket.connect(); // os , device name , broweser , app , uesername ;
}

export function Send(data: string, room: string) {  // send data client to server   
  socket.emit("Syc-msgS", data, room);
}


export function reqjoing(roomName: string, username: string){
  socket.emit("pre-joinreq",roomName,username) //make event name for room exist or not ,
}

socket.on("done-joinreq",(roomName:string,uesername:string,ans:boolean)=>{
  if(ans){
    joining(roomName,uesername);
  }else{
    console.log("error bro find some glass then write roomcode  again ")
  }
  // my question thta i had put this into else or just leave it ?
  //set(!boolean) assuming the boolean will be flase and then we will take one and pls enter vaild code or anything  
  // make variable show that we are not having this room try again 
})

export function joining(roomName: string, username: string) {
  const { os, device } = getDeviceInfo();

  const myInfo: Clientinfo = {
    user: username,
    room: roomName,
    os: os,
    device: device
  };
  
  socket.emit("join-room", myInfo);
}

{

  // function Socket({ReactNode}:Props) {    // so this normal function like other so do i need to make proprs here too 
  //   const [content, setContent] = useState("");  // y used this we can just used the normal variable 

  //   useEffect(() => {      // y u sed this i don't know
  //     socket.on("clipboard", (data: string) => {
  //       setContent(data);
  //     });

  //     return () => {
  //       socket.off("clipboard");   //off what ?? 
  //     };
  //   }, []);

  //   return content;
  // }
}