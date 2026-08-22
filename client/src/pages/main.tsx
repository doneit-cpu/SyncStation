import Filesharing from "../components/filesharing"
import Clipboardy from '../components/clipboard'
import Audio from "../components/audio"
import Alert from '../components/alert'
import { useSync } from '../context/syncontext'
import "./main.css"

const Main = () => {
  const { alertdata } = useSync();
  return (

    <div className='mainbody'>
      {alertdata && <Alert />}
      <h1>God god</h1>
      <div className='headerbar'>hih</div>
      <div className='godgod'>
        <Clipboardy />
        <Filesharing />
      </div>
      <div className='audiocontainer'>
        <Audio />
      </div>
      <div className='infobuttom'>asdgsadg</div>
    </div>
  )
}

export default Main
