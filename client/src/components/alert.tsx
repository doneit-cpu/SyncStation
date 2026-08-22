import { useEffect } from 'react';
import { useSync } from "../context/syncontext"
import "./alert.css";

const Alert = () => {

  const { alertdata, setalert } = useSync();

  useEffect(() => {
    if (alertdata) {
      const timer = setTimeout(() => {
        setalert(null);
      }, 3000); // Auto-dismiss after 3 seconds

      return () => clearTimeout(timer);// remove timer
    }
  }, [alertdata, setalert]);

  if (!alertdata) return null;
  const classMap: Record<string, string> = {
    success: "alert-success",
    error: "alert-error",
    warning: "alert-warning",
    info: "alert-info"
  };

  return (
    <div className={`alert-container ${classMap[alertdata.type]}`}>
      {alertdata.message}
    </div>
  );
};

export default Alert;
