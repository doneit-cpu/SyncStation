import "./main.css"
import Filesharing from "../components/filesharing"
import Clipboardy from '../components/clipboard'
import Audio from "../components/audio"

const Main = () => {
  return (
    <div className='mainbody'>
      <h1>God god</h1>
      <div className='headerbar'>hih</div>
      <div className='godgod'>
        <Clipboardy/>
        <Filesharing />
      </div>
      <div className='audiocontainer'>
        <Audio/>
      </div>
      <div className='infobuttom'>asdgsadg</div>
    </div>
  )
}

export default Main
