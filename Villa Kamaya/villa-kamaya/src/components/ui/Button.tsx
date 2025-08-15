import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'booking';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  style?: React.CSSProperties;
}

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  style,
  ...props
}: ButtonProps) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'var(--accent)',
          color: 'var(--text-primary)',
          border: 'none',
          borderRadius: '9999px'
        };
      case 'secondary':
        return {
          backgroundColor: 'var(--text-primary)',
          color: 'var(--bg-primary)',
          border: 'none',
          borderRadius: '9999px'
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-primary)',
          border: `2px solid var(--accent)`,
          borderRadius: '9999px'
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-secondary)',
          border: 'none',
          borderRadius: '9999px'
        };
      case 'booking':
        return {
          fontSize: '1rem',
          lineHeight: '1.5',
          boxSizing: 'border-box',
          textDecoration: 'none',
          maxWidth: '100%',
          gridColumnGap: '.7rem',
          gridRowGap: '.7rem',
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-secondary)',
          borderRadius: '.4rem',
          justifyContent: 'flex-start',
          alignItems: 'center',
          padding: '.75rem 1.5rem',
          display: 'flex',
          border: 'none'
        };
      default:
        return {};
    }
  };

  const sizes = {
    sm: 'px-4 py-2',
    md: 'px-6 py-3',
    lg: 'px-8 py-4',
  };

  return (
    <button
      className={cn(
        baseClasses,
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      style={{
        ...getVariantStyles(),
        ...style
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;