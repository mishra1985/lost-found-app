import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  fullWidth = true,
  className = '',
  ...rest
}) => {
  return (
    <div className={`mb-4 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label 
          htmlFor={rest.id} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      
      <input
        className={`
          px-3 py-2 bg-white border shadow-sm border-gray-300 
          placeholder:text-gray-400 
          focus:outline-none focus:border-primary-500 focus:ring-primary-500 
          ${error ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}
          block w-full rounded-md sm:text-sm focus:ring-1
          ${className}
        `}
        {...rest}
      />
      
      {error && (
        <p className="mt-1 text-sm text-error-600">{error}</p>
      )}
    </div>
  );
};

export default Input;