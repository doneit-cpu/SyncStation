import { useEffect } from 'react';
import { useSync } from "../context/syncontext"

const Alert = () => {

  const { alerto, setalert } = useSync();

  useEffect(() => {
    if (alerto) {
      const timer = setTimeout(() => {
        setalert(null);
      }, 3000); // Auto-dismiss after 3 seconds

      // Cleanup: if alert changes or component unmounts, clear the timer
      return () => clearTimeout(timer);
    }
  }, [alerto, setalert]);

  if (!alerto) return null;

  return (
    <div
      className={`fixed top-5 right-5 p-3 rounded text-white z-50 ${alerto.type === "success"? "bg-green-500": alerto.type === "info"? "bg-blue-500": alerto.type === "warning"? "bg-yellow-500": "bg-red-500"}`}>
      {alerto.message}
    </div>
  )
}

export default Alert
