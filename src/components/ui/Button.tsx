import React from 'react';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { loading?: boolean; variant?: 'primary' | 'ghost'; full?: boolean; }
export const Button: React.FC<ButtonProps> = ({ loading, children, variant='primary', full, ...rest }) => {
  return (
    <button
      {...rest}
      disabled={loading || rest.disabled}
      className={`btn btn-${variant} ${full? 'btn-full':''} ${rest.className||''}`.trim()}
    >
      {loading ? '...' : children}
    </button>
  );
};

// styles via global utility classes
