import Gateway from '../components/gateway'
import Foote from '../components/foote'
import Alert from '../components/alert'
import { useSync } from '../context/syncontext'
import "./home.css"


const Home = () => {
  const { alertdata } = useSync();

  const pwe_i=()=>{
     console.log("pwa istallion");
    (<link rel="manifest" href="manifest.json" />)
  }

  return (
    <div className='home-card'>
      {alertdata && <Alert />}
      <div className='headstatusbar'>
        <h2>SYNCSTATION</h2>
        <button onClick={pwe_i}>Self-Host Guide</button>
      </div>
      <div className='girdway-container'>
        <div className='left-panel'>
          <h1> Pair once </h1>
          <h1> Move anything. </h1>
          <span></span>
          <p> Clipboard text,files, and quick voice clips move directly between your device -- no account , no cloud storage, no frictio </p>
        </div >
        <div>
          <Gateway />
        </div>
      </div>
      <Foote />
    </div>
  )
}

export default Home