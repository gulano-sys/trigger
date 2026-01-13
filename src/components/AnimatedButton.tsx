
import React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({
    className,
    children,
    variant = 'default',
    size = 'md',
    isLoading = false,
    icon,
    iconPosition = 'left',
    ...props
  }, ref) => {
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg',
    };

    const variantClasses = {
      default: 'bg-zero-dark-200 border border-zero-yellow/30 hover:border-zero-yellow/70 text-white hover:text-zero-yellow transition-all duration-300 yellow-glow-sm hover:yellow-glow',
      outline: 'bg-transparent border border-zero-yellow/40 hover:border-zero-yellow/80 text-zero-yellow/80 hover:text-zero-yellow transition-all duration-300',
      ghost: 'bg-transparent hover:bg-zero-yellow/10 text-zero-yellow/80 hover:text-zero-yellow transition-colors duration-300',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-none font-medium transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2',
          sizeClasses[size],
          variantClasses[variant],
          isLoading && 'opacity-80 cursor-not-allowed',
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        <span className="relative z-10 flex items-center gap-2">
          {isLoading ? (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-zero-yellow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            iconPosition === 'left' && icon
          )}
          {children}
          {iconPosition === 'right' && !isLoading && icon}
        </span>
        <span className="absolute inset-0 overflow-hidden rounded-none">
          <span className="absolute inset-0 rounded-none bg-gradient-to-r from-zero-yellow/0 via-zero-yellow/20 to-zero-yellow/0 -translate-x-full animate-shimmer"></span>
        </span>
      </button>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';

export default AnimatedButton;
