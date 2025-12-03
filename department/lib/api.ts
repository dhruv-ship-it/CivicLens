const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export interface ApiError {
  error: string
}

export interface Department {
  id: string
  department: "waterlogging" | "potholes" | "garbages" | "streetlight" | "others"
  pincode: string
}

export interface Complaint {
  id: string
  username: string
  category: string
  address: string
  description?: string
  pincode: string
  upvotes: number
  downvotes: number
  createdAt: string
}

// Get token from localStorage
export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("dept_token")
}

// Set token in localStorage
export function setToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("dept_token", token)
  }
}

// Remove token from localStorage
export function removeToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("dept_token")
  }
}

// API request helper
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "An error occurred")
  }

  return data
}

// Department Auth APIs
export const departmentAuth = {
  signup: async (
    department: "waterlogging" | "potholes" | "garbages" | "streetlight" | "others",
    pincode: string,
    password: string
  ) => {
    const data = await apiRequest<{ token: string; department: Department }>("/departments/signup", {
      method: "POST",
      body: JSON.stringify({ department, pincode, password }),
    })
    setToken(data.token)
    return data
  },

  login: async (
    department: "waterlogging" | "potholes" | "garbages" | "streetlight" | "others",
    pincode: string,
    password: string
  ) => {
    const data = await apiRequest<{ token: string; department: Department }>("/departments/login", {
      method: "POST",
      body: JSON.stringify({ department, pincode, password }),
    })
    setToken(data.token)
    return data
  },

  getProfile: async (): Promise<Department> => {
    return apiRequest<Department>("/departments/me")
  },
}

// Complaint APIs
export const complaints = {
  getDepartmentComplaints: async (): Promise<{ complaints: Complaint[] }> => {
    return apiRequest<{ complaints: Complaint[] }>("/complaints/department")
  },

  resolve: async (complaintId: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/complaints/${complaintId}`, {
      method: "DELETE",
    })
  },
}

