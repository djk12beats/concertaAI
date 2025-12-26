import React from 'react';

interface AuthLayoutProps {
    children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background px-4">
            <div className="w-full max-w-md p-8 space-y-8 bg-surface rounded-2xl shadow-xl border border-secondary/20 relative">
                {children}
            </div>
        </div>
    );
};
