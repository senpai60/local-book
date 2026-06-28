import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center transition-all duration-150 focus:outline-none border tracking-widest uppercase font-light cursor-pointer select-none';
  
  const variants = {
    primary: 'bg-[#F5F5F5] text-[#090909] border-[#F5F5F5] hover:bg-white hover:border-white',
    secondary: 'bg-transparent text-[#F5F5F5] border-[#1f1f1f] hover:border-[#F5F5F5] hover:text-white',
    ghost: 'bg-transparent text-[#8D8D8D] border-transparent hover:text-[#F5F5F5]',
    danger: 'bg-transparent text-red-500 border-[#1f1f1f] hover:border-red-500/50 hover:text-red-400'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-[10px]',
    md: 'px-4 py-2 text-xs',
    lg: 'px-6 py-3 text-sm'
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
export default Button;
