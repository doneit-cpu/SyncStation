import { Send } from "../services/socket.ts";
import { useSync } from "../context/syncontext.tsx"

const Clipboardy = () => {  
    
    const {history , room }=useSync();

    const readClipboard = async () => {   // does asyc function would work prefectly 
      const value = await navigator.clipboard.readText();
      Send(value,room);   // this one return value of so // this coming from the this file and gone to socket.io ? 
    };

    const writeClipboard = async ()  => {  // (t_contenst) was wrong move here ?
      const content=history[history.length-1]
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
