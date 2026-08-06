import Gateway from '../components/gateway'
import "./home.css"

const Home = () => {
  return (
    <div className='home-card'>
      <div className='headstatusbar'>
        <h1>SYNCSTATION</h1>
          <button onClick={() => { console.log("next to other page") }}><h3>Self-Host Guide</h3></button>
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
      <div className='footer'> footer </div>
    </div>
  )
}

export default Home