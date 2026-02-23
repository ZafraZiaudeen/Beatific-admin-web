import { useNavigate } from 'react-router-dom'
import Dashboard from '../components/Dashboard'

export default function DashboardPage() {
  const navigate = useNavigate()

  return (
    <Dashboard
      onEdit={() => navigate('/templates/editor')}
      onEditSticker={() => navigate('/stickers/editor')}
      onViewTemplates={() => navigate('/templates')}
      onViewStickers={() => navigate('/stickers')}
    />
  )
}
