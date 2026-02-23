import { Outlet } from 'react-router-dom'

export default function EditorLayout() {
  return (
    <div className="min-h-screen text-stone-800 h-screen overflow-hidden flex flex-col">
      <Outlet />
    </div>
  )
}
