import React, { useState, type ReactNode } from 'react'

interface Props {
  onUsernameChange: (username: string) => void; // checking weather username vaild or not ? , i'm using stocketio here so if want check i had to send to server ? .emit() ? but how can i send back to server ? // what if i make event name by combing so , like add username of both ? we can send to sever , like put include the if then server recive work done , but how do send back to server , i can't made event like while running or can , send seding function , i can do this ? 
}

const Inputtext = ({ onUsernameChange }: Props) => {
  const [username, setusername] = useState(""); // do i have to render it or make this userstate , but don't passing hook from parent force it already ? 
  return (
    <>
      <div className="input-group mb-3">
        <span className="input-group-text" id="basic-addon1">@</span>
        <input value={username} type="text" className="form-control" placeholder="Username"
          onChange={(e) => {
            setusername(e.target.value);
            onUsernameChange(username);
          }} />
      </div>
    </>
  )
}


export default Inputtext
