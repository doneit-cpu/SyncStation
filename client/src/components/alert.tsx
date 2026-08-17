import { useEffect } from 'react';
import { useSync } from "../context/syncontext"
import "./alert.css";

const Alert = () => {

  const { alert, setalert } = useSync();

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setalert(null);
      }, 3000); // Auto-dismiss after 3 seconds

      return () => clearTimeout(timer);// remove timer
    }
  }, [alert, setalert]);

  if (!alert) return null;
const classMap: Record<string, string> = {
        success: "alert-success",
        error: "alert-error",
        warning: "alert-warning",
        info: "alert-info"
      };

  return (
    <div className={`alert-container ${classMap[alert.type]}`}>
      {alert.message}
    </div>
  );
};

export default Alert;
