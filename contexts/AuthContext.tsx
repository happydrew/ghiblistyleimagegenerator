import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import LoginModal from '@components/auth/LoginModal';
import { MemoryRouter } from 'react-router-dom';

type AuthContextType = {
    session: Session | null
    user: User | null
    isLoading: boolean
    signIn: (email: string, password: string) => Promise<any>
    signUp: (email: string, password: string) => Promise<any>
    signOut: () => void
    credits: number
    setCredits: (credits: number) => void,
    setIsLoginModalOpen: (isOpen: boolean) => void,
    setLoginModalRedirectTo: (redirectTo: string | null) => void,
    setLoginModalDefaultPath: (defaultPath: string | null) => void,
    refreshCredits: () => Promise<void>
    getAccessToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [credits, setCredits] = useState<number>(0)
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
    const [loginModalRedirectTo, setLoginModalRedirectTo] = useState<string | null>("/")
    const [loginModalDefaultPath, setLoginModalDefaultPath] = useState<string | null>("/")


    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
        }).finally(() => {
            setIsLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
            setIsLoading(false)
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    // Fetch user credits when user changes
    useEffect(() => {
        if (user) {
            fetchUserCredits()
        }
    }, [user])

    const fetchUserCredits = async () => {
        if (!user) return

        try {
            const { data, error } = await supabase
                .from('credits_balance')
                .select('credits')
                .eq('user_id', user.id)
                .single()

            if (error) {
                console.error('Error fetching credits:', error)
                return
            }

            if (data) {
                setCredits(data.credits)
            } else {
                console.log('No credits found for user:', user.id)
            }
        } catch (error) {
            console.error('Error in fetchUserCredits:', error)
        }
    }

    const signIn = (email: string, password: string) => {
        return supabase.auth.signInWithPassword({ email, password })
    }

    const signUp = (email: string, password: string) => {
        return supabase.auth.signUp({ email, password })
    }

    const signOut = () => {
        supabase.auth.signOut()
        setCredits(0)
    }

    const refreshCredits = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('credits_balance')
                .select('credits')
                .eq('user_id', user.id)
                .single();

            if (error) {
                console.error('Error refreshing credits:', error);
                return;
            }

            if (data) {
                setCredits(data.credits);
            }
        } catch (error) {
            console.error('Error in refreshCredits:', error);
        }
    };

    const getAccessToken = async (): Promise<string | null> => {
        try {
            const { data, error } = await supabase.auth.getSession();

            if (error) {
                console.error('Error getting session:', error);
                return null;
            }

            return data.session?.access_token || null;
        } catch (error) {
            console.error('Error in getAccessToken:', error);
            return null;
        }
    };

    const value = {
        session,
        user,
        setUser,
        isLoading,
        signIn,
        signUp,
        signOut,
        credits,
        setCredits,
        setIsLoginModalOpen,
        setLoginModalRedirectTo,
        setLoginModalDefaultPath,
        refreshCredits,
        getAccessToken
    }

    return <AuthContext.Provider value={value}>
        <MemoryRouter>
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                redirectTo={loginModalRedirectTo}
                defaultPath={loginModalDefaultPath}
            />
        </MemoryRouter>
        {children}
    </AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
} 