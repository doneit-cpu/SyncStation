import React, { type ReactNode } from 'react'
import { useState } from "react";
import { Send } from "../services/socket.ts";

interface Props{
  t_content : string[] ; // the text i got from the user 
  room :string // s_content : ReactNode ;  // i would be taking the text from the user it can be long so i that's i put array box ???
  
}

const Clipboardy = ({t_content,room}:Props) => {  
    
    const readClipboard = async () => {   // does asyc function would work prefectly 
      const value = await navigator.clipboard.readText();
      Send(value,room);   // this one return value of so // this coming from the this file and gone to socket.io ? 
    };

    const writeClipboard = async ()  => {  // (t_contenst) was wrong move here ?
      const content=t_content.pop();
      t_content.push(content!);
      await navigator.clipboard.writeText(content || "404"); // MAKE  error handing if button is pushed if data is there , or we can do this if and only we have somthing in the array got it  
      console.log(content);
    };

    return (
      <div>
        <button onClick={readClipboard}>Read Clipboard</button>  
        <button onClick={writeClipboard}>Write Clipboard</button>
      </div>
    );
  
  }
  
export default Clipboardy
