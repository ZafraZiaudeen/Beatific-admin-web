import { useNavigate } from 'react-router-dom'
import StickersList from '../components/StickersList'

export default function StickersPage() {
  const navigate = useNavigate()

  return (
    <StickersList
      onEdit={(id) => navigate(`/stickers/editor/${id}`)}
      onNew={() => navigate('/stickers/editor')}
    />
  )
}
