import { useEffect, useState } from 'react'

const units = [
  { key: 'years',   label: 'Anos',    emoji: '🎂', gradient: 'from-pink-400 to-rose-500' },
  { key: 'months',  label: 'Meses',   emoji: '🌙', gradient: 'from-rose-400 to-pink-500' },
  { key: 'days',    label: 'Dias',    emoji: '☀️', gradient: 'from-fuchsia-400 to-purple-500' },
  { key: 'hours',   label: 'Horas',   emoji: '⏰', gradient: 'from-purple-400 to-indigo-500' },
  { key: 'minutes', label: 'Minutos', emoji: '⚡', gradient: 'from-indigo-400 to-purple-500' },
  { key: 'seconds', label: 'Segundos',emoji: '💓', gradient: 'from-pink-500 to-rose-600' },
]

function calcTime(anniversaryDate) {
  const start = new Date(anniversaryDate).getTime()
  let diff = Math.max(0, Date.now() - start)

  const ms = { year: 31557600000, month: 2629800000, day: 86400000, hour: 3600000, minute: 60000, second: 1000 }

  const years   = Math.floor(diff / ms.year);   diff -= years   * ms.year
  const months  = Math.floor(diff / ms.month);  diff -= months  * ms.month
  const days    = Math.floor(diff / ms.day);    diff -= days    * ms.day
  const hours   = Math.floor(diff / ms.hour);   diff -= hours   * ms.hour
  const minutes = Math.floor(diff / ms.minute); diff -= minutes * ms.minute
  const seconds = Math.floor(diff / ms.second)

  return { years, months, days, hours, minutes, seconds }
}

export default function Counter({ anniversaryDate }) {
  const [time, setTime] = useState(null)

  useEffect(() => {
    if (!anniversaryDate) return
    setTime(calcTime(anniversaryDate))
    const id = setInterval(() => setTime(calcTime(anniversaryDate)), 1000)
    return () => clearInterval(id)
  }, [anniversaryDate])

  if (!anniversaryDate || !time) return null

  return (
    <div className="mt-6 animate-fadeInUp">
      <div className="text-center mb-5">
        <h3 className="font-romantic text-gradient-pink text-2xl">Tempo Juntos</h3>
        <p className="text-gray-400 text-sm mt-1">cada segundo conta 💕</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {units.map(({ key, label, emoji, gradient }, i) => (
          <div
            key={key}
            className={`bg-gradient-to-br ${gradient} rounded-2xl p-4 text-center text-white shadow-lg
              transform hover:scale-105 transition-all duration-300 cursor-default`}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className="text-xl mb-1">{emoji}</div>
            <div
              key={time[key]}
              className="text-3xl font-bold tabular-nums leading-none animate-fadeInScale"
            >
              {String(time[key]).padStart(2, '0')}
            </div>
            <div className="text-xs mt-1 font-semibold opacity-90 uppercase tracking-wide">
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Total de dias em destaque */}
      <div className="mt-4 glass rounded-2xl p-4 text-center border border-pink-200">
        <p className="text-gray-500 text-sm">Total de dias juntos</p>
        <p className="font-romantic text-gradient-pink text-3xl mt-1">
          {Math.floor(Math.max(0, Date.now() - new Date(anniversaryDate).getTime()) / 86400000).toLocaleString('pt-BR')}
        </p>
        <p className="text-gray-400 text-xs mt-1">dias de muito amor 🌹</p>
      </div>
    </div>
  )
}
