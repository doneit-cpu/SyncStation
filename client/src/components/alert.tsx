import { useSync } from "../context/syncontext"
// make custom so it show alert or like green or red or something like that when wanted ? just add last three ward in problem sting what type of problem is this okay 
// add more things about how u want to add or other things , got it 

const Alert = () => {

  const { alert } = useSync();

  return (
    <div
      className={`p-3 rounded text-white ${alert.type === "success"? "bg-green-500": alert.type === "info"? "bg-blue-500": alert.type === "warning"? "bg-yellow-500": "bg-red-500"}`}>
      {alert.massage}
    </div>
  )
}

export default Alert
