import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverEffect = true,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-[#121212] border border-[#1f1f1f] p-5 transition-all duration-300 ${
        hoverEffect ? 'hover:border-[#8D8D8D]/40' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
