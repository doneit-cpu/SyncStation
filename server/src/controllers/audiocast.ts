import { io } from "../socket";

const clockoffshets=new Map<string,number>()

let timer:number;

export function setClientoffset(socketid:string,offset:number){
  clockoffshets.set(socketid,offset);
}

export function deletidoffset(socketid:string){
  clockoffshets.delete(socketid);
}

export function getClintoffset(socketid:string):number{
  return clockoffshets.get(socketid)??0;
} 

