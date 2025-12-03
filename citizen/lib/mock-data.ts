export type Category = "waterlogging" | "potholes" | "garbages" | "streetlight" | "others"

export interface Complaint {
  id: string
  category: Category
  username: string
  address: string
  description?: string
  imageUrl?: string
  upvotes: number
  downvotes: number
  createdAt: string
  pincode: string
}

export interface User {
  id: string
  username: string
  email: string
  pincode: string
}

export const mockComplaints: Complaint[] = [
  {
    id: "1",
    category: "potholes",
    username: "john_citizen",
    address: "123 Main Street, Block A",
    description: "Large pothole near the intersection causing traffic issues. Multiple vehicles have been damaged.",
    imageUrl: "/pothole-on-road.jpg",
    upvotes: 24,
    downvotes: 2,
    createdAt: "2024-01-15",
    pincode: "110001",
  },
  {
    id: "2",
    category: "waterlogging",
    username: "sarah_m",
    address: "45 Park Avenue, Sector 12",
    description: "Severe waterlogging after every rain. The drainage system seems blocked.",
    imageUrl: "/waterlogged-street-flooding.jpg",
    upvotes: 18,
    downvotes: 1,
    createdAt: "2024-01-14",
    pincode: "110001",
  },
  {
    id: "3",
    category: "garbages",
    username: "mike_r",
    address: "78 Green Colony, Phase 2",
    description: "Garbage not collected for over a week. The area is starting to smell.",
    upvotes: 31,
    downvotes: 0,
    createdAt: "2024-01-13",
    pincode: "110001",
  },
  {
    id: "4",
    category: "streetlight",
    username: "emily_w",
    address: "Road No. 5, Industrial Area",
    description: "Three streetlights not working. Very dark and unsafe at night.",
    imageUrl: "/dark-street-broken-streetlight.jpg",
    upvotes: 15,
    downvotes: 3,
    createdAt: "2024-01-12",
    pincode: "110001",
  },
  {
    id: "5",
    category: "others",
    username: "david_k",
    address: "Near Central Market, Shop Lane",
    description: "Broken bench in the public park. Sharp edges are dangerous for children.",
    upvotes: 8,
    downvotes: 1,
    createdAt: "2024-01-11",
    pincode: "110001",
  },
]

export const mockUser: User = {
  id: "1",
  username: "john_citizen",
  email: "john@example.com",
  pincode: "110001",
}

export const categoryColors: Record<Category, string> = {
  waterlogging: "bg-sky-100 text-sky-700",
  potholes: "bg-amber-100 text-amber-700",
  garbages: "bg-lime-100 text-lime-700",
  streetlight: "bg-purple-100 text-purple-700",
  others: "bg-gray-100 text-gray-700",
}

export const categoryLabels: Record<Category, string> = {
  waterlogging: "Waterlogging",
  potholes: "Potholes",
  garbages: "Garbages",
  streetlight: "Streetlight",
  others: "Others",
}
