const ErrorAlert = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="mb-4 flex items-start justify-between gap-3 rounded-xl bg-red-100 px-4 py-3 text-red-800"
    >
      <p className="text-sm font-medium">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-red-600 hover:text-red-800"
          aria-label="Dismiss error"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default ErrorAlert;
