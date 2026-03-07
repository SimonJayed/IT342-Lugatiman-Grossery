import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  fullWidth = false,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: {
      style: {
        backgroundColor: 'var(--primary)',
        color: '#ffffff',
        border: 'none',
      },
      className: "hover:bg-[#7aaf5a]" // using manual hex for hover capability if generic css isn't used
    },
    secondary: {
      style: {
        backgroundColor: 'transparent',
        border: '1.5px solid var(--primary)',
        color: 'var(--muted)',
      },
      className: "hover:bg-[#eef7e8]"
    },
    outline: { // Same as secondary for now, but can be distinct
      style: {
        backgroundColor: 'transparent',
        border: '1.5px solid var(--primary)',
        color: 'var(--muted)',
      },
      className: "hover:bg-[#eef7e8]"
    }
  };

  // Inline styles for dynamic CSS variables usage
  const style = {
    padding: '0.625rem 1.25rem', // 10px 20px
    borderRadius: 'var(--radius-sm)',
    fontSize: '1rem',
    cursor: 'pointer',
    width: fullWidth ? '100%' : 'auto',
    ...variants[variant]?.style,
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${className}`}
      style={style}
      {...props}
      onMouseEnter={(e) => {
        if (!props.disabled) { // Only hover if not disabled
          if (variant === 'primary') e.currentTarget.style.backgroundColor = 'var(--primary-dark)';
          if (variant === 'secondary' || variant === 'outline') e.currentTarget.style.backgroundColor = 'var(--primary-xlight)';
        }
      }}
      onMouseLeave={(e) => {
        if (!props.disabled) {
          if (variant === 'primary') e.currentTarget.style.backgroundColor = 'var(--primary)';
          if (variant === 'secondary' || variant === 'outline') e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      {children}
    </button>
  );
};

export default Button;
