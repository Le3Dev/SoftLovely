import { useEffect, useState } from 'react'

function FloatingHearts() {
  const [hearts, setHearts] = useState([])

  useEffect(() => {
    const items = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 18 + 10}px`,
      duration: `${Math.random() * 8 + 6}s`,
      delay: `${Math.random() * 6}s`,
      emoji: Math.random() > 0.5 ? '💕' : '✨',
    }))
    setHearts(items)
  }, [])

  return (
    <>
      {hearts.map(h => (
        <span
          key={h.id}
          className="heart-particle select-none"
          style={{
            left: h.left,
            fontSize: h.size,
            animationDuration: h.duration,
            animationDelay: h.delay,
          }}
        >
          {h.emoji}
        </span>
      ))}
    </>
  )
}

export default function Hero({ partners = [], themeColor, slug }) {
  const names = partners.map(p => p.name).filter(Boolean)
  const title = names.length >= 2
    ? `${names[0]} & ${names[1]}`
    : names[0] || slug

  const p1 = partners[0]
  const p2 = partners[1]

  return (
    <div className="relative overflow-hidden rounded-3xl py-14 px-6 text-center"
      style={{
        background: `linear-gradient(135deg, #fce4ec 0%, #fdf2f8 40%, #ede9fe 100%)`,
        boxShadow: '0 20px 60px rgba(236, 72, 153, 0.2)',
      }}
    >
      <FloatingHearts />

      {/* Sparkles decorativos */}
      <span className="absolute top-6 left-8 text-2xl animate-sparkle delay-100">✨</span>
      <span className="absolute top-10 right-10 text-xl animate-sparkle delay-300">🌸</span>
      <span className="absolute bottom-8 left-12 text-xl animate-sparkle delay-500">💫</span>
      <span className="absolute bottom-6 right-8 text-2xl animate-sparkle delay-200">✨</span>

      <div className="relative z-10">
        {/* Fotos dos parceiros */}
        {(p1 || p2) && (
          <div className="flex items-center justify-center gap-4 mb-8 animate-fadeInScale">
            {/* Parceiro 1 */}
            <div className="animate-slideInLeft">
              {p1?.profileImageUrl ? (
                <img
                  src={p1.profileImageUrl}
                  alt={p1.name}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-pink-400 shadow-xl"
                  style={{ boxShadow: '0 0 0 4px #fce4ec, 0 8px 30px rgba(236,72,153,0.3)' }}
                />
              ) : (
                <div
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center text-4xl border-4 border-pink-400 shadow-xl bg-gradient-to-br from-pink-200 to-rose-200"
                  style={{ boxShadow: '0 0 0 4px #fce4ec, 0 8px 30px rgba(236,72,153,0.3)' }}
                >
                  {p1?.name?.[0] || '💑'}
                </div>
              )}
              {p1?.name && (
                <p className="mt-2 text-sm font-bold text-pink-600">{p1.name}</p>
              )}
            </div>

            {/* Coração central */}
            <div className="flex flex-col items-center animate-heartbeat">
              <span className="text-5xl md:text-6xl">❤️</span>
            </div>

            {/* Parceiro 2 */}
            <div className="animate-slideInRight">
              {p2?.profileImageUrl ? (
                <img
                  src={p2.profileImageUrl}
                  alt={p2.name}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-purple-400 shadow-xl"
                  style={{ boxShadow: '0 0 0 4px #ede9fe, 0 8px 30px rgba(168,85,247,0.3)' }}
                />
              ) : (
                <div
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center text-4xl border-4 border-purple-400 shadow-xl bg-gradient-to-br from-purple-200 to-pink-200"
                  style={{ boxShadow: '0 0 0 4px #ede9fe, 0 8px 30px rgba(168,85,247,0.3)' }}
                >
                  {p2?.name?.[0] || '💑'}
                </div>
              )}
              {p2?.name && (
                <p className="mt-2 text-sm font-bold text-purple-600">{p2.name}</p>
              )}
            </div>
          </div>
        )}

        {/* Título */}
        <h1 className="font-romantic text-gradient-pink text-4xl md:text-5xl mb-3 animate-fadeInUp">
          {title}
        </h1>

        <p className="text-gray-500 text-lg animate-fadeInUp delay-200">
          Uma história de amor única e especial 💕
        </p>

        {/* Divisor decorativo */}
        <div className="flex items-center justify-center gap-3 mt-6 animate-fadeInUp delay-300">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-pink-300" />
          <span className="text-pink-400 text-xl animate-float">🌸</span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-pink-300" />
        </div>
      </div>
    </div>
  )
}
