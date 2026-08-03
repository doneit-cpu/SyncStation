import { useState } from 'react'
import { useSync } from '../context/syncontext';

interface Props {
  content: string;
}

const Inputtext = ({ content }: Props) => {
  const { setUsername, joingreq, setaler, setroom } = useSync();
  const [username, setusername] = useState(""); // do i have to render it or make this userstate , but don't passing hook from parent force it already ? 
  return (
    <>
      <div className="input-group mb-3">
        <span className="input-group-text" id="basic-addon1">@</span>
        <input value={username} type="text" className="form-control" placeholder={content}
          onChange={(e) => {
            setusername(e.target.value);
            if (content == "Username") {
              setUsername(e.target.value);
            } else if (content == "Room-code") {
              setroom(e.target.value);
            }
          }} />
        <button onClick={() => { joingreq(), setaler(false) }}>throw it</button>
      </div>
    </>
  )
}


export default Inputtext
