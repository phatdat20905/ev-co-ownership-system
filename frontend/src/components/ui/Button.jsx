import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const Button = forwardRef(
  ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false,
    disabled = false,
    className = '',
    icon: Icon,
    ...props 
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-sky-500 text-white hover:bg-sky-600 focus:ring-sky-500',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
      danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
      success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500',
      outline: 'border-2 border-sky-500 text-sky-500 hover:bg-sky-50 focus:ring-sky-500',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    };
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };
    
    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            {Icon && <Icon className="h-4 w-4 mr-2" />}
            {children}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
