import { useSync } from "../context/syncontext"

interface AlertProps {
  message: string;
}

const Alert = ({ message }: AlertProps) => {
  return (
    <div className="alert">
      {message}
    </div>
  )
}

export default Alert
