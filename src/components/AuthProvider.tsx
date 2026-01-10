'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, getCurrentUserData } from '@/lib/supabase';
import { User } from '@/types';

interface AuthContextType {
    user: any;
    userData: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [userData, setUserData] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUserData = async () => {
        if (user) {
            try {
                const data = await getCurrentUserData(user.id);
                setUserData(data);
            } catch (error) {
                console.error('Error refreshing user data:', error);
            }
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            try {
                const { data: { user: currentUser } } = await supabase.auth.getUser();
                setUser(currentUser);

                if (currentUser) {
                    const data = await getCurrentUserData(currentUser.id);
                    setUserData(data);
                }
            } catch (error) {
                console.error('Auth init error:', error);
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
            setUser(session?.user || null);
            if (session?.user) {
                try {
                    const data = await getCurrentUserData(session.user.id);
                    setUserData(data);
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            } else {
                setUserData(null);
            }
        });

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setUserData(null);
    };

    return (
        <AuthContext.Provider value={{ user, userData, loading, signOut: handleSignOut, refreshUserData }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
