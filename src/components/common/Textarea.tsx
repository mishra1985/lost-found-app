import React, { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Textarea: React.FC<TextareaProps> = ({
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
      
      <textarea
        className={`
          px-3 py-2 bg-white border shadow-sm border-gray-300 
          placeholder:text-gray-400 
          focus:outline-none focus:border-primary-500 focus:ring-primary-500 
          ${error ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}
          block w-full rounded-md sm:text-sm focus:ring-1 min-h-[100px]
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

export default Textarea;