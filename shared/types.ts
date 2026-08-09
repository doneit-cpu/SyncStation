export interface Clientinfo{
  user:string;
  os:string;
  room:string;   // ?if join two room then but it would be same nothing else
  device:string;
  // what if brower connect from the pc , so we need to see who using at other stage 
}

export interface Fileinfo{
  id:string;
  name:string;
  size:number;
  type:string;
  sender:string; // username and socket.id combination , but after user gone , it would shown upload or treat it as uniqe id okay 
  downloadlink:string,
}