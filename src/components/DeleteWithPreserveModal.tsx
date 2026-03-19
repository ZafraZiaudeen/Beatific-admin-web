type Props = {
  title: string
  description: string
  onClose: () => void
  onPreserve: () => void
  onDeleteEverywhere: () => void
  deleting?: boolean
  error?: string | null
}

export default function DeleteWithPreserveModal({
  title,
  description,
  onClose,
  onPreserve,
  onDeleteEverywhere,
  deleting = false,
  error = null,
}: Props) {
  const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14H6L5 6"/>
      <path d="M9 6V4h6v2"/>
    </svg>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <TrashIcon />
            </div>
            <div>
              <p className="font-bold text-stone-900">{title}</p>
              <p className="text-sm text-stone-400 mt-0.5">This action cannot be undone</p>
            </div>
          </div>
          <p className="text-sm text-stone-600 bg-stone-50 rounded-xl px-3 py-3">
            {description}
          </p>
          <p className="text-xs text-stone-500">
            Choose whether existing journal owners can keep using it.
          </p>
          {error && (
            <div className="px-3 py-2 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
              {error}
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={deleting}
              className="flex-1 py-2.5 text-sm font-semibold text-stone-600 bg-stone-100 rounded-xl hover:bg-stone-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onPreserve}
              disabled={deleting}
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-stone-700 rounded-xl hover:bg-stone-800 disabled:opacity-50 transition-colors"
            >
              {deleting ? 'Deleting…' : 'Delete, Keep Users'}
            </button>
            <button
              onClick={onDeleteEverywhere}
              disabled={deleting}
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-rose-600 rounded-xl hover:bg-rose-700 disabled:opacity-50 transition-colors"
            >
              {deleting ? 'Deleting…' : 'Delete Everywhere'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
