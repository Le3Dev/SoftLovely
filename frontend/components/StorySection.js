import { useState } from 'react'

export default function StorySection({ story, onGenerate }) {
  const [loading, setLoading] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    await onGenerate()
    setLoading(false)
  }

  return (
    <div className="mt-6 glass rounded-2xl p-5 border border-pink-100 shadow-md animate-fadeInUp delay-200">
      <div className="text-center mb-4">
        <span className="text-3xl animate-float inline-block">✍️</span>
        <h4 className="font-romantic text-gradient-pink text-xl mt-1">Nossa História</h4>
        <p className="text-gray-400 text-xs">gerada com carinho pela IA 💫</p>
      </div>

      {story && story !== 'Gerando...' && story !== 'Erro ao gerar história' ? (
        <div className="relative mb-4">
          <span className="text-pink-200 text-5xl font-serif absolute -top-2 -left-1 leading-none">"</span>
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line italic px-4 pt-3">
            {story}
          </p>
          <span className="text-pink-200 text-5xl font-serif absolute -bottom-4 right-0 leading-none">"</span>
        </div>
      ) : story === 'Gerando...' ? (
        <div className="flex flex-col items-center py-6 text-pink-400">
          <div className="animate-heartbeat text-4xl mb-2">💕</div>
          <p className="text-sm">Escrevendo sua história...</p>
        </div>
      ) : story === 'Erro ao gerar história' ? (
        <p className="text-center text-red-400 text-sm py-4">Ops! Tenta novamente 😢</p>
      ) : (
        <div className="text-center py-4 mb-2">
          <p className="text-gray-400 text-sm">Clique abaixo para gerar a história de vocês com IA</p>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full mt-4 py-3 rounded-xl font-bold text-white text-sm
          bg-gradient-to-r from-pink-500 to-rose-500
          hover:from-pink-600 hover:to-rose-600
          disabled:opacity-60 disabled:cursor-not-allowed
          shadow-md hover:shadow-lg transition-all duration-300
          transform hover:-translate-y-0.5 active:translate-y-0"
      >
        {loading ? '💕 Gerando...' : story ? '✨ Gerar nova história' : '✨ Gerar história'}
      </button>
    </div>
  )
}
