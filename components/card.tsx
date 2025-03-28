import React, { ReactNode } from 'react';
import Image from 'next/image';

interface CardProps {
  title?: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  title,
  description,
  imageSrc,
  imageAlt = "Card image",
  children,
  className = "",
  onClick
}) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 ${className}`}
      onClick={onClick}
    >
      {imageSrc && (
        <div className="relative h-48 w-full">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-6">
        {title && <h3 className="text-xl font-bold mb-2">{title}</h3>}
        {description && <p className="text-gray-600 mb-4">{description}</p>}
        {children}
      </div>
    </div>
  );
};
