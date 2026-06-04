const Card = ({ children, className = '' }) => (
  <div
    className={`rounded-3xl bg-white p-6 shadow-xl transition-all duration-300 ${className}`}
  >
    {children}
  </div>
);

export default Card;
