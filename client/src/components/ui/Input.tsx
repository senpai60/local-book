import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  className = '',
  type = 'text',
  ...props
}, ref) => {
  return (
    <div className="w-full flex flex-col gap-1">
      {label && (
        <label className="text-[9px] text-[#8D8D8D] uppercase tracking-widest font-medium select-none">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={`w-full bg-transparent text-[#F5F5F5] border-b border-[#1f1f1f] py-2 px-0.5 focus:border-[#F5F5F5] focus:outline-none transition-colors duration-250 text-sm font-light placeholder-[#8D8D8D]/30 ${className}`}
        {...props}
      />
      {error && (
        <span className="text-[10px] text-red-500/80 font-light mt-1 tracking-wider">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
