import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../api/hooks'
import { fetchUserProfile } from '../actions/authAction'

export default function ProtectedLayout() {
  const { isAuthenticated } = useAppSelector((s) => s.auth)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/sign-in', { replace: true })
    } else {
      dispatch(fetchUserProfile())
    }
  }, [isAuthenticated, navigate, dispatch])

  if (!isAuthenticated) return null

  return <Outlet />
}
