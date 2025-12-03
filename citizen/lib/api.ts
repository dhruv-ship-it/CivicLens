const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export interface ApiError {
  error: string
}

export interface User {
  id: string
  username: string
  email: string
  pincode: string
}

export interface Complaint {
  id: string
  username: string
  category: "waterlogging" | "potholes" | "garbages" | "streetlight" | "others"
  address: string
  description?: string
  pincode: string
  upvotes: number
  downvotes: number
  createdAt: string
  userVote?: "upvote" | "downvote" | null
}

// Get token from localStorage
export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

// Set token in localStorage
export function setToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token)
  }
}

// Remove token from localStorage
export function removeToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token")
  }
}

// API request helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (token) {
    (headers as any).Authorization = `Bearer ${token}`
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

// User Auth APIs
export const userAuth = {
  signup: async (username: string, email: string, password: string, pincode: string) => {
    const data = await apiRequest<{ token: string; user: User }>("/users/signup", {
      method: "POST",
      body: JSON.stringify({ username, email, password, pincode }),
    })
    setToken(data.token)
    return data
  },

  login: async (username: string, password: string) => {
    const data = await apiRequest<{ token: string; user: User }>("/users/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    })
    setToken(data.token)
    return data
  },

  getProfile: async (): Promise<User> => {
    return apiRequest<User>("/users/me")
  },

  updateProfile: async (updates: {
    username?: string
    pincode?: string
    currentPassword?: string
    newPassword?: string
  }): Promise<{ user: User }> => {
    return apiRequest<{ user: User }>("/users/profile", {
      method: "PUT",
      body: JSON.stringify(updates),
    })
  },
}

// Complaint APIs
export const complaints = {
  create: async (complaint: {
    category: string
    address: string
    description?: string
  }): Promise<{ complaint: Complaint }> => {
    return apiRequest<{ complaint: Complaint }>("/complaints", {
      method: "POST",
      body: JSON.stringify(complaint),
    })
  },

  createWithImage: async (formData: FormData): Promise<{ complaint: Complaint }> => {
    const token = getToken()
    
    const response = await fetch(`${API_BASE_URL}/complaints`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      } as HeadersInit,
      body: formData,
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || "An error occurred")
    }
    
    return data
  },

  getUserComplaints: async (): Promise<{ complaints: Complaint[] }> => {
    return apiRequest<{ complaints: Complaint[] }>("/complaints/user")
  },

  upvote: async (complaintId: string): Promise<{ upvote: number; downvote: number; userVote: "upvote" | "downvote" | null }> => {
    return apiRequest<{ upvote: number; downvote: number; userVote: "upvote" | "downvote" | null }>(`/complaints/${complaintId}/upvote`, {
      method: "POST",
    })
  },

  downvote: async (complaintId: string): Promise<{ upvote: number; downvote: number; userVote: "upvote" | "downvote" | null }> => {
    return apiRequest<{ upvote: number; downvote: number; userVote: "upvote" | "downvote" | null }>(`/complaints/${complaintId}/downvote`, {
      method: "POST",
    })
  },
}

