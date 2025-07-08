import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className={`fixed top-6 right-6 z-50 px-4 py-2 rounded shadow-lg text-white animate-fadeIn transition-all duration-300
      ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
      style={{ minWidth: 200 }}
    >
      {message}
      <button onClick={onClose} className="ml-4 text-white/80 hover:text-white text-lg font-bold">×</button>
    </div>
  );
};

export default Toast; 