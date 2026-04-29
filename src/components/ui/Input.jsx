export default function Input({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  autoComplete,
  required = false,
  disabled = false,
  error = '',
}) {
  const hasError = Boolean(error)
  const errorId = hasError ? `${id}-error` : undefined

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        aria-invalid={hasError}
        aria-describedby={errorId}
        className={`w-full border rounded-lg px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 ${
          hasError ? 'border-red-500' : 'border-gray-300'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
      />
      {hasError && (
        <p id={errorId} role="alert" className="text-red-600 text-sm mt-1">
          {error}
        </p>
      )}
    </div>
  )
}