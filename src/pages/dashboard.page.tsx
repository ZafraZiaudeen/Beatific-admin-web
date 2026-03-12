import { useNavigate } from 'react-router-dom'
import Dashboard from '../components/Dashboard'

export default function DashboardPage() {
  const navigate = useNavigate()
  return (
    <Dashboard
      onNewContent={() => navigate('/content/editor')}
      onViewContent={() => navigate('/content')}
    />
  )
}
