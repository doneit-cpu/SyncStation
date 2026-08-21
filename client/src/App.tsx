// how i get content from backend which has no db , just live data by socketio from the server ? so how , i need to give data to t_content
// we need to gather data and if possible make json , or object , and gather info ? don't where i gather info ? '' done 
// i need to make user name and room code gen ,well username person give but be check by broswer 
//  only one person made ther fucking room code and then share , it ,also if u want to make one then u should check if person is not join in any group or anything okay , 
// both after the whatever room would need render the page ? without dobout thingk about it 

import {  Navigate, Route, Routes, } from "react-router-dom"

import Home from "./pages/home.tsx"
import Main from "./pages/main.tsx"

const App = () => {

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<Home />} />
      <Route path="/main" element={<Main />} />
    </Routes>

  )
}

export default App;
