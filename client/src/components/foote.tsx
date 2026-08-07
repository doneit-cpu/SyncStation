import { useSync } from '../context/syncontext'


const Foote = () => {

 const { Lanip, platfrom, socket } = useSync();
  const appMode = platfrom === 'electron' ? 'Desktop-App' : platfrom;
  const isOnline = Boolean(socket?.connected);

  return (
    <div className="footer">
      <span>Local Node: {Lanip}</span>
      <span>Gateway: {isOnline ? 'Active' : 'Warning'}</span>
      <span>App Mode: {appMode}</span>
    </div>


  )
}

export default Foote
