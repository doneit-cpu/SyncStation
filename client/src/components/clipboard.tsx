import { Send } from "../services/socket.ts";
import { useSync } from "../context/syncontext.tsx"

const Clipboardy = () => {

  const { history, room } = useSync();

  const readClipboard = async () => {   // does asyc function would work prefectly 
    try {
      // Attempt to read from clipboard
      const value = await navigator.clipboard.readText();
      console.log("readed",value);
      if(value){   // i think this was problem right ?? 
        if((!history.length) && (history[history.length - 1]===value)){  // preventing from send uselsee duplicate 
          console.log("it's already copied "); // what i do 
          return;
        }else{
          Send(value,room);
          console.log("data send from the first node , read function");
        }
      }
    } catch (err) {
      // Handle error (permission denied, or clipboard busy)
      console.error("Failed to read clipboard:", err);
      alert("Could not access clipboard. Please ensure you have granted permission.");
    }
  };

  const writeClipboard = async () => {  // (t_contenst) was wrong move here ?
    try {
      const content = history[history.length - 1];
      if (!content) {
        alert("No history available to write to clipboard.");
        return;
      }
      console.log("copied",history[history.length-1]);
      await navigator.clipboard.writeText(content);
    } catch (err) {
      // Handle error
      console.error("Failed to write to clipboard:", err);
      alert("Could not write to clipboard.");
    }
  };

  return (
    <div>
      <button onClick={readClipboard}>Read Clipboard</button>
      <button onClick={writeClipboard}>Write Clipboard</button>
    </div>
  );

}

export default Clipboardy


