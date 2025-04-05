import { useState, useEffect } from "react";

interface ErrorMessageProps {
  message: string;
  onDismiss: () => void;
  autoClose?: boolean;
  duration?: number;
}

const ErrorMessage = ({ message, onDismiss, autoClose = true, duration = 5000 }: ErrorMessageProps) => {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onDismiss();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onDismiss]);
  
  return (
    <div className="fixed inset-x-0 top-4 mx-auto max-w-md z-50">
      <div className="bg-error text-white px-4 py-3 rounded-lg shadow-lg flex items-center">
        <span className="material-icons mr-2">error</span>
        <span>{message}</span>
        <button 
          className="ml-auto text-white"
          onClick={onDismiss}
        >
          <span className="material-icons">close</span>
        </button>
      </div>
    </div>
  );
};

export default ErrorMessage;
