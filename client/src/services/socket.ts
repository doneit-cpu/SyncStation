import { io } from "socket.io-client"
import { history } from "../App.tsx"
import { getDeviceInfo } from "./utlis.ts";
import type { Clientinfo } from "../../../shared/types.ts"  // add type when only sharing for type of thing 

export const socket = io("http://localhost:3000", {
  autoConnect: false,
});

export function connect() {
  socket.connect(); // os , device name , broweser , app , uesername ;
}

export function Send(data: string, room: string) {  // send data client to server   
  socket.emit("Syc-msgS", data, room);
}

socket.on("Syc-msgC", (data: string) => {  // take data from server 
  console.log("final stage", data)
  // way to find way put data into the device weather pc or phone 
  history.push(data);
  console.log(socket.id); // would be here 
})

export function joining(roomName: string, username: string) {
  const { os, device } = getDeviceInfo();

  const myInfo : Clientinfo = {
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