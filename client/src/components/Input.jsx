const Input = ({
  label,
  id,
  value,
  onChange,
  placeholder,
  maxLength,
  className = '',
}) => (
  <div className={className}>
    {label && (
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>
    )}
    <input
      id={id}
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg text-gray-900 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
      aria-label={label || placeholder}
    />
  </div>
);

export default Input;
