import { useNavigate, useParams } from 'react-router-dom'
import EditorView from '../components/EditorView'

export default function TemplateEditorPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  return (
    <EditorView
      documentType="template"
      editingId={id ?? null}
      onBack={() => navigate('/templates')}
      onSaved={(savedId) => {
        if (!id) navigate(`/templates/editor/${savedId}`, { replace: true })
      }}
    />
  )
}
