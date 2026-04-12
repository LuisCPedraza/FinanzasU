export default function Button({
  type = 'button',
  children,
  loading = false,
  loadingText = 'Procesando...',
  disabled = false,
}) {
  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading}
      className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
    >
      {loading ? (
        <span className="inline-flex items-center justify-center gap-2">
          <span
            aria-hidden="true"
            className="w-4 h-4 border-2 border-white/70 border-t-white rounded-full animate-spin"
          />
          {loadingText}
        </span>
      ) : (
        children
      )}
    </button>
  )
}