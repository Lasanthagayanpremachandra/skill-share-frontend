"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import api from "@/lib/api"

interface User {
  id: number
  name: string
  email: string
  bio?: string
  profilePicture?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      setToken(storedToken)
      fetchCurrentUser()
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const userData = await api.users.getCurrentUser()
      setUser(userData)
    } catch (error) {
      console.error("Error fetching user data:", error)
      logout()
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const data = await api.auth.login(email, password)
      setToken(data.token)
      setUser(data.user)
      localStorage.setItem("token", data.token)
    } catch (error) {
      console.error("Login error:", error)
      throw new Error("Invalid email or password")
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const data = await api.auth.register(name, email, password)
      setToken(data.token)
      setUser(data.user)
      localStorage.setItem("token", data.token)
    } catch (error) {
      console.error("Registration error:", error)
      throw new Error("Registration failed. Email may already be in use.")
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
