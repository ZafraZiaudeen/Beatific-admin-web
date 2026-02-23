

export default function CanvasMock() {
  return (
    <div id="konva-container" className="w-[500px] h-[700px] bg-white shadow-lg relative cursor-crosshair ring-1 ring-stone-900/5">
      <div className="absolute top-10 left-0 w-full text-center">
        <h1 className="serif-font text-3xl text-stone-800">2024</h1>
        <p className="text-xs uppercase tracking-[0.2em] text-stone-400 mt-2">Planner</p>
      </div>

      <div className="absolute top-32 left-10 w-32 h-32 border border-rose-400 border-dashed bg-rose-50/10">
        <div className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-rose-400"></div>
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-rose-400"></div>
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-rose-400"></div>
        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-rose-400"></div>
      </div>
    </div>
  )
}
