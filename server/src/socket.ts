import { Server, Socket } from "socket.io";
import { s_content } from "./controllers/clipboard.ts"
import  type { Clientinfo  } from "../../shared/types.ts"

const clients=new Map<string,Clientinfo>; // the string here for socketid

export function setupSocket(io: Server) {

    io.on("connection", (socket) => {

        socket.on("join-room", (data:Clientinfo) => {
            clients.set(socket.id,data); // map are diff here
            socket.join(data.room);  //  main thing 
            
        });

        socket.on("Syc-msgS", (data,) => { // got from user 
            socket.to(clients.get(socket.id)!.room).emit("Syc-msgC", data);
        });

        socket.on("Syc-msgC", (data:string) => {    // here we made overwrite into clipboard 
            // if(only if device is not android or mac)?? how do i handle it ?  // used electron fast 
            // used this as diff rought or send diff data accorinding to platfrom  
            // socket.io-client does can recive the the info so y don't we made diff event for lp,pwa , browser 
            
        })

        socket.on("error", (err) => {
            console.error("Socket Error:", err);
        });

        socket.on("disconnect", (reason) => {
            clients.delete(socket.id);
            console.log("goodbye frd:", reason, socket.id);
        });
    });
}


{
    // user come to site 
    // but at the moment client open site they are connect to socket.io right or wrong , or does they click button ?? or i can button ?
    // user need uniqe name (we have to do this in fronend ) , also we need the device type  
    // then join the room or made new depend on need 
    // after this he connect to socket io , which way we connect our server and client , so all above data goes to each other how i don't how 


    // console.log("Connected:", socket.id);
    // socket.on("message", () => {
    //     console.log("client as connected ");
    // });

    /*export async function s_content(data:string) {
    console.log("we will overwritten")
    clipboard.write(data);
    code of s_content
    }*/
}      