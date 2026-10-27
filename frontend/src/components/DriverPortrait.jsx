import { getDriverImage } from '../config/driverImages.js'

export default function DriverPortrait({ code, name }) {
  const src = getDriverImage(code)
  return (
    <div className="portrait">
      {src ? <img src={src} alt={name} loading="lazy" /> : code}
    </div>
  )
}