"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { userAuth, type User, setToken, removeToken, getToken } from "./api"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  signup: (username: string, email: string, password: string, pincode: string) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Check if user is logged in on mount
  useEffect(() => {
    const token = getToken()
    if (token) {
      userAuth
        .getProfile()
        .then((userData) => {
          setUser(userData)
        })
        .catch(() => {
          removeToken()
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (username: string, password: string) => {
    const data = await userAuth.login(username, password)
    setUser(data.user)
    router.push("/home")
  }

  const signup = async (username: string, email: string, password: string, pincode: string) => {
    const data = await userAuth.signup(username, email, password, pincode)
    setUser(data.user)
    router.push("/home")
  }

  const logout = () => {
    removeToken()
    setUser(null)
    router.push("/login")
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

