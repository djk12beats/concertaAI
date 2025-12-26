import { createContext } from 'react';
import { User } from '../types';

export interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<User | null>;
    logout: () => void;
    updateCurrentUser: (data: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
