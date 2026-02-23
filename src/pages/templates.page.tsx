import { useNavigate } from 'react-router-dom'
import TemplatesList from '../components/TemplatesList'

export default function TemplatesPage() {
  const navigate = useNavigate()

  return (
    <TemplatesList
      onEdit={(id) => navigate(`/templates/editor/${id}`)}
      onNew={() => navigate('/templates/editor')}
    />
  )
}
