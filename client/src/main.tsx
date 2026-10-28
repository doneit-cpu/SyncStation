import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SyncProvider } from './context/syncontext.tsx'
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById('root')!).render(
  <SyncProvider>  
      <App />
  </SyncProvider>,
)
