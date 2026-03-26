import { useEffect, useState } from 'react'

export default function Counter({ anniversaryDate }) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const id = setInterval(()=>setNow(Date.now()), 1000)
    return ()=>clearInterval(id)
  }, [])

  if (!anniversaryDate) return null
  const start = new Date(anniversaryDate).getTime()
  let diff = Math.max(0, now - start)

  const msPerMinute = 1000*60
  const msPerHour = msPerMinute*60
  const msPerDay = msPerHour*24
  const msPerYear = msPerDay*365

  const years = Math.floor(diff / msPerYear)
  diff -= years * msPerYear
  const days = Math.floor(diff / msPerDay)
  diff -= days * msPerDay
  const hours = Math.floor(diff / msPerHour)
  diff -= hours * msPerHour
  const minutes = Math.floor(diff / msPerMinute)

  return (
    <div className="mt-4 p-4 bg-white rounded shadow">
      <h3 className="font-semibold">Juntos há</h3>
      <div className="mt-2 text-2xl font-bold text-pink-600">{years} anos {days} dias {hours} horas {minutes} minutos</div>
    </div>
  )
}

