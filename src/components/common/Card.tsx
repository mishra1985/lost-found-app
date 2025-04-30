import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '',
  hover = false,
}) => {
  return (
    <div 
      className={`
        bg-white rounded-lg shadow-card p-4 
        ${hover ? 'transition-shadow hover:shadow-card-hover' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;