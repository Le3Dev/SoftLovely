const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

function resolveImg(ev) {
  const raw = ev?.imageUrl || ev?.image_url || ev?.photoUrl || ev?.photo_url
    || ev?.fileUrl || ev?.file_url || ev?.image || ev?.photo || ev?.url || null
  if (!raw) return null
  if (raw.startsWith('http')) return raw
  return `${API_BASE}${raw}`
}

export default function Timeline({ events = [] }) {
  if (!events.length) {
    return (
      <div className="mt-6 glass rounded-2xl p-6 text-center border border-pink-100 animate-fadeInUp">
        <span className="text-4xl">📖</span>
        <p className="text-gray-400 mt-2 text-sm">Nenhum momento especial ainda.<br />Adicione memórias da vocês!</p>
      </div>
    )
  }

  return (
    <div className="mt-6 animate-fadeInUp">
      <div className="text-center mb-5">
        <h3 className="font-romantic text-gradient-pink text-2xl">Nossa História</h3>
        <p className="text-gray-400 text-sm mt-1">momentos que guardaremos para sempre 📸</p>
      </div>

      <div className="relative">
        {/* Linha vertical */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-300 via-rose-300 to-purple-300 rounded-full" />

        <div className="space-y-6">
          {events.map((ev, i) => {
            const imgSrc = resolveImg(ev)
            return (
              <div
                key={ev.id}
                className="relative flex gap-4 animate-slideInLeft"
                style={{ animationDelay: `${i * 0.45}s`, animationDuration: '1.1s', animationTimingFunction: 'cubic-bezier(0.22,1,0.36,1)' }}
              >
                {/* Marcador coração */}
                <div
                  className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-lg"
                  style={{ animation: `heartbeat 2.8s ease-in-out ${i * 0.5}s infinite` }}
                >
                  <span className="text-white text-sm">💕</span>
                </div>

                {/* Card do evento */}
                <div className="flex-1 glass rounded-2xl overflow-hidden border border-pink-100 shadow-md hover:shadow-lg hover:border-pink-300 transition-all duration-500 hover:-translate-y-0.5">
                  {imgSrc && (
                    <div className="h-44 overflow-hidden">
                      <img
                        src={imgSrc}
                        alt={ev.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                        onError={e => { e.currentTarget.style.display = 'none' }}
                      />
                    </div>
                  )}
                  <div className="p-4">
                    {ev.eventDate && (
                      <p className="text-xs text-pink-400 font-semibold mb-1">
                        📅 {new Date(ev.eventDate).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    )}
                    <h4 className="font-bold text-gray-800 text-base">{ev.title}</h4>
                    {ev.description && (
                      <p className="text-gray-500 text-sm mt-1 leading-relaxed">{ev.description}</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
