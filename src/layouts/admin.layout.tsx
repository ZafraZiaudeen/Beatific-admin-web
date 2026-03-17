import { Outlet, useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../api/hooks'
import { logoutUser } from '../actions/authAction'
import Sidebar from '../components/Sidebar'
import HeaderBar from '../components/HeaderBar'

export default function AdminLayout() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await dispatch(logoutUser())
    navigate('/sign-in', { replace: true })
  }

  return (
    <div className="min-h-screen text-stone-800 h-screen overflow-hidden flex flex-col">
      <div className="flex-1 flex overflow-hidden min-h-0">
        <Sidebar onLogout={handleLogout} />
        <main className="flex-1 flex flex-col h-full overflow-hidden min-h-0 relative">
          <HeaderBar onLogout={handleLogout} />
          <Outlet />
        </main>
      </div>
    </div>
  )
}
