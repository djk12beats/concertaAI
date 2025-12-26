import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, loading, className = '', disabled, ...props }) => {
    return (
        <button
            disabled={disabled || loading}
            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-slate-800 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-primary/50 ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
