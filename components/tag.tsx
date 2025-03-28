import React, { ReactNode } from 'react';

interface TagProps {
  children: ReactNode;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  className?: string;
  onClick?: () => void;
}

export const Tag: React.FC<TagProps> = ({
  children,
  color = 'blue',
  className = '',
  onClick
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    purple: 'bg-purple-100 text-purple-800',
    gray: 'bg-gray-100 text-gray-800'
  };

  return (
    <span
      className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${colorClasses[color]} ${className}`}
      onClick={onClick}
    >
      {children}
    </span>
  );
};
