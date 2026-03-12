import { useNavigate, useParams } from 'react-router-dom'
import EditorView from '../components/EditorView'

export default function PageEditorPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  return (
    <EditorView
      documentType="page"
      editingId={id ?? null}
      singlePageMode
      onBack={() => navigate('/pages')}
      onSaved={(savedId) => {
        if (!id) navigate(`/pages/editor/${savedId}`, { replace: true })
      }}
    />
  )
}
