import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import EditorView from '../components/EditorView'


export default function ContentEditorPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()

  const documentType = searchParams.get('type') ?? 'content'

  return (
    <EditorView
      documentType={documentType}
      editingId={id ?? null}
      onBack={() => navigate(-1)}
      onSaved={(savedId) => {
        if (!id) navigate(`/content/editor/${savedId}`, { replace: true })
      }}
    />
  )
}
