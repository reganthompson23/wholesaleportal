import { createContext, useContext, useState } from 'react'

interface AuthContextType {
  user: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null)
  const [loading] = useState(false)

  // Temporary mock auth functions
  const signIn = async (email: string, password: string) => {
    // For testing, let's consider admin@example.com as admin
    setUser({ email, isAdmin: email === 'admin@example.com' })
  }

  const signOut = async () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
