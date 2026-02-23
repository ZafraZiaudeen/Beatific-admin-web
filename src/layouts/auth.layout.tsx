import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAppSelector } from '../api/hooks'

export default function AuthLayout() {
  const { isAuthenticated } = useAppSelector((s) => s.auth)
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, navigate])

  return (
    <div className="min-h-screen h-screen overflow-hidden">
      <Outlet />
    </div>
  )
}
