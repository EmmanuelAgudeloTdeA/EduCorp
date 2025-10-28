import React from 'react';

const Card = ({ children, title, subtitle, className = "" }) => {
  return (
    <div className="flex items-center justify-center flex-1 px-4 sm:px-6 lg:px-8">
      <div className={`w-full max-w-md space-y-8 ${className}`}>
        {(title || subtitle) && (
          <div>
            {title && (
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-2 text-center text-sm text-gray-600">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default Card;