import React, { SelectHTMLAttributes } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  options: Option[];
  error?: string;
  onChange: (value: string) => void;
  fullWidth?: boolean;
}

const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  value,
  onChange,
  fullWidth = true,
  className = '',
  ...rest
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

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
      
      <select
        value={value}
        onChange={handleChange}
        className={`
          px-3 py-2 bg-white border shadow-sm border-gray-300 
          placeholder:text-gray-400 
          focus:outline-none focus:border-primary-500 focus:ring-primary-500 
          ${error ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}
          block w-full rounded-md sm:text-sm focus:ring-1
          ${className}
        `}
        {...rest}
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="mt-1 text-sm text-error-600">{error}</p>
      )}
    </div>
  );
};

export default Select;