export default function StorySection({ story, onGenerate }) {
  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold">História (IA)</h4>
        <button className="px-3 py-1 bg-pink-600 text-white rounded" onClick={onGenerate}>Gerar história</button>
      </div>
      <div className="mt-3 text-sm whitespace-pre-line text-gray-800">{story || 'Nenhuma história gerada ainda.'}</div>
    </div>
  )
}

