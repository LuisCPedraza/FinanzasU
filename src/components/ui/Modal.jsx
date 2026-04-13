export default function Modal({ isOpen, onClose, title, size = 'md', children, footer }) {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className={`bg-surface-container rounded-2xl shadow-xl ${sizeClasses[size]} w-full mx-4`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-outline-variant/20">
          <h2 className="text-lg font-bold text-on-surface">{title}</h2>
        </div>
        <div className="px-6 py-6">
          {children}
        </div>
        {footer && (
          <div className="px-6 py-4 border-t border-outline-variant/20 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
