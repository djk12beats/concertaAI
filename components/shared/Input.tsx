import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ className = '', label, error, id, ...props }) => {
    return (
        <div className="w-full">
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-primary mb-1 pl-1">
                    {label}
                </label>
            )}
            <input
                id={id}
                className={`appearance-none block w-full px-4 py-3 border rounded-xl placeholder-primary/40 text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm bg-input-bg ${error ? 'border-red-500' : 'border-secondary'} ${className}`}
                {...props}
            />
            {error && <p className="mt-1 text-sm text-red-500 pl-1">{error}</p>}
        </div>
    );
};
