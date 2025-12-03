"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { departmentAuth, removeToken, getToken, type Department as ApiDepartment } from "./api"

export type Department = "Waterlogging" | "Potholes" | "Garbages" | "Streetlight" | "Others"

// Convert frontend department name to API format
function toApiDepartment(dept: Department): ApiDepartment {
  const map: Record<Department, ApiDepartment> = {
    Waterlogging: "waterlogging",
    Potholes: "potholes",
    Garbages: "garbages",
    Streetlight: "streetlight",
    Others: "others",
  }
  return map[dept]
}

// Convert API department name to frontend format
function fromApiDepartment(dept: ApiDepartment): Department {
  const map: Record<ApiDepartment, Department> = {
    waterlogging: "Waterlogging",
    potholes: "Potholes",
    garbages: "Garbages",
    streetlight: "Streetlight",
    others: "Others",
  }
  return map[dept]
}

interface DepartmentUser {
  department: Department
  pincode: string
}

interface AuthContextType {
  user: DepartmentUser | null
  loading: boolean
  login: (department: Department, pincode: string, password: string) => Promise<void>
  signup: (department: Department, pincode: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DepartmentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Check if user is logged in on mount
  useEffect(() => {
    const token = getToken()
    if (token) {
      departmentAuth
        .getProfile()
        .then((deptData) => {
          setUser({
            department: fromApiDepartment(deptData.department),
            pincode: deptData.pincode,
          })
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

  const login = async (department: Department, pincode: string, password: string) => {
    const data = await departmentAuth.login(toApiDepartment(department), pincode, password)
    const newUser = {
      department: fromApiDepartment(data.department.department),
      pincode: data.department.pincode,
    }
    setUser(newUser)
    // Use setTimeout to ensure state is updated before navigation
    setTimeout(() => {
      router.push("/dashboard")
    }, 0)
  }

  const signup = async (department: Department, pincode: string, password: string) => {
    const data = await departmentAuth.signup(toApiDepartment(department), pincode, password)
    const newUser = {
      department: fromApiDepartment(data.department.department),
      pincode: data.department.pincode,
    }
    setUser(newUser)
    // Use setTimeout to ensure state is updated before navigation
    setTimeout(() => {
      router.push("/dashboard")
    }, 0)
  }

  const logout = () => {
    removeToken()
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
