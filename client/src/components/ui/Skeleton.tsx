import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'image' | 'circle' | 'rect';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rect',
  className = '',
  ...props
}) => {
  const baseClass = "bg-[#121212] animate-pulse";
  const variants = {
    text: "h-2 w-full",
    image: "h-[200px] w-full",
    circle: "rounded-full",
    rect: "w-full"
  };
  
  return (
    <div 
      className={`${baseClass} ${variants[variant]} ${className}`} 
      {...props} 
    />
  );
};

export default Skeleton;
