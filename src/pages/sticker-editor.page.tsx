import { useNavigate, useParams } from 'react-router-dom'
import EditorView from '../components/EditorView'

export default function StickerEditorPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  return (
    <EditorView
      documentType="sticker"
      editingId={id ?? null}
      onBack={() => navigate('/stickers')}
      onSaved={(savedId) => {
        if (!id) navigate(`/stickers/editor/${savedId}`, { replace: true })
      }}
    />
  )
}
