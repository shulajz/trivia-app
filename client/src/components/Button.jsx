const Button = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  type = 'button',
  className = '',
  ariaLabel,
}) => {
  const base =
    'w-full rounded-2xl px-6 py-4 text-lg font-bold transition-all duration-200 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50';

  const variants = {
    primary:
      'bg-yellow-400 text-purple-900 shadow-lg hover:bg-yellow-300 focus:ring-yellow-200 active:scale-[0.98]',
    secondary:
      'bg-pink-500 text-white shadow-lg hover:bg-pink-400 focus:ring-pink-300 active:scale-[0.98]',
    outline:
      'border-2 border-white/60 bg-white/10 text-white hover:bg-white/20 focus:ring-white/30',
    ghost: 'bg-transparent text-white hover:bg-white/10',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
