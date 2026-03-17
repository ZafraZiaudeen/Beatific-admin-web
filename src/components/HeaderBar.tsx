import { useLocation, useSearchParams } from 'react-router-dom'
import homeIcon from '../assets/icons/home.svg'
import bellIcon from '../assets/icons/bell.svg'

type Props = {
  onLogout?: () => void
}

function getLabel(pathname: string, searchParams: URLSearchParams): string {
  if (pathname === '/dashboard')           return 'Overview'
  if (pathname.startsWith('/content/editor')) return 'Editor'
  if (pathname === '/content') {
    const type = searchParams.get('type')
    if (type) {
      const formatted = type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      return formatted.endsWith('s') ? formatted : formatted + 's'
    }
    return 'Content'
  }
  if (pathname.startsWith('/templates')) return 'Editor'
  if (pathname.startsWith('/stickers'))  return 'Editor'
  return pathname.replace(/^\//, '').replace(/-/g, ' ')
}

export default function HeaderBar({ onLogout }: Props) {
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()
  return (
    <header className="h-12 bg-white border-b border-stone-200 flex items-center justify-between px-6 shrink-0 z-10">
      <div className="flex items-center gap-1.5 text-sm text-stone-500">
        <img src={homeIcon} alt="Home" width={12} height={12} />
        <span className="text-stone-400">›</span>
        <span className="text-stone-800 font-medium capitalize">{getLabel(pathname, searchParams)}</span>
      </div>
      <div className="flex items-center gap-3">
        <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors">
          <img src={bellIcon} alt="Notifications" width={15} height={15} />
        </button>
        <button
          onClick={onLogout}
          className="text-xs font-medium text-stone-500 hover:text-stone-900 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  )
}
