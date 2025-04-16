import { useEffect } from 'react';

function Alert({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Auto-close after 3 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white ${
        type === 'success' ? 'bg-cool-teal' : 'bg-coral-red'
      }`}
    >
      <div className="flex items-center">
        <span>{message}</span>
        <button onClick={onClose} className="ml-4 text-lg font-bold">
          &times;
        </button>
      </div>
    </div>
  );
}

export default Alert;