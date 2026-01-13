
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    id: string;
    username: string;
    avatar: string | null;
    hasRole: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
    setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode; initialUser: User | null }> = ({ children, initialUser }) => {
    const [user, setUser] = useState<User | null>(initialUser);
    const [loading, setLoading] = useState(false);

    const logout = async () => {
        try {
            await fetch('/api/auth/logout');
            setUser(null);
            window.location.reload();
        } catch (e) {
            console.error("Logout failed", e);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
