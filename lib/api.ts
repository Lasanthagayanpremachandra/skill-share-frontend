import axios from "axios"

// Create an axios instance for the Spring Boot backend
const axiosInstance = axios.create({
  baseURL: "http://localhost:8080", // Change this to your Spring Boot backend URL
  headers: {
    "Content-Type": "application/json",
  },
})

// Add a request interceptor to include the auth token in all requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized errors (expired token, etc.)
      localStorage.removeItem("token")
      window.location.href = "/auth/login"
    }
    return Promise.reject(error)
  },
)

// API service using axios
export const api = {
  // Posts API
  posts: {
    getAll: async (page = 0, size = 10) => {
      const response = await axiosInstance.get(`/posts?page=${page}&size=${size}`)
      return response.data
    },

    getFeed: async (page = 0, size = 10) => {
      const response = await axiosInstance.get(`/posts/feed?page=${page}&size=${size}`)
      return response.data
    },

    getById: async (id: number) => {
      const response = await axiosInstance.get(`/posts/${id}`)
      return response.data
    },

    create: async (content: string, type: string, media?: File[]) => {
      // For file uploads, we still need to use FormData
      if (media && media.length > 0) {
        const formData = new FormData()
        formData.append("content", content)
        formData.append("type", type)

        media.forEach((file) => {
          formData.append("media", file)
        })

        const response = await axiosInstance.post("/posts", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        return response.data
      } else {
        // Without files, we can use JSON
        const response = await axiosInstance.post("/posts", {
          content,
          type,
        })
        return response.data
      }
    },

    update: async (id: number, content: string) => {
      const response = await axiosInstance.put(`/posts/${id}`, {
        content,
      })
      return response.data
    },

    delete: async (id: number) => {
      await axiosInstance.delete(`/posts/${id}`)
    },

    like: async (id: number) => {
      const response = await axiosInstance.post(`/posts/${id}/like`)
      return response.data
    },

    unlike: async (id: number) => {
      const response = await axiosInstance.delete(`/posts/${id}/like`)
      return response.data
    },
  },

  // Learning Plans API
  learningPlans: {
    getAll: async (page = 0, size = 10) => {
      const response = await axiosInstance.get(`/learning-plans?page=${page}&size=${size}`)
      return response.data
    },

    getMyPlans: async (page = 0, size = 10) => {
      const response = await axiosInstance.get(`/learning-plans/my-plans?page=${page}&size=${size}`)
      return response.data
    },

    create: async (plan: {
      title: string
      description: string
      targetCompletionDate: string
      steps: Array<{
        title: string
        description: string
        resourceUrl?: string
      }>
    }) => {
      const response = await axiosInstance.post("/learning-plans", plan)
      return response.data
    },

    update: async (
      id: number,
      plan: {
        title: string
        description: string
        targetCompletionDate: string
        steps: Array<{
          title: string
          description: string
          resourceUrl?: string
        }>
      },
    ) => {
      const response = await axiosInstance.put(`/learning-plans/${id}`, plan)
      return response.data
    },

    delete: async (id: number) => {
      await axiosInstance.delete(`/learning-plans/${id}`)
    },
  },

  // Users API
  users: {
    getCurrentUser: async () => {
      const response = await axiosInstance.get("/users/me")
      return response.data
    },

    getById: async (id: number) => {
      const response = await axiosInstance.get(`/users/${id}`)
      return response.data
    },

    updateProfile: async (data: { name: string; bio: string }) => {
      const response = await axiosInstance.put("/users/me", data)
      return response.data
    },

    updateProfilePicture: async (file: File) => {
      const formData = new FormData()
      formData.append("file", file)

      const response = await axiosInstance.post("/users/me/profile-picture", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    },

    follow: async (id: number) => {
      await axiosInstance.post(`/users/${id}/follow`)
    },

    unfollow: async (id: number) => {
      await axiosInstance.delete(`/users/${id}/follow`)
    },

    search: async (query: string) => {
      const response = await axiosInstance.get(`/users/search?query=${encodeURIComponent(query)}`)
      return response.data
    },
  },

  // Notifications API
  notifications: {
    getAll: async (page = 0, size = 10) => {
      const response = await axiosInstance.get(`/notifications?page=${page}&size=${size}`)
      return response.data
    },

    getUnreadCount: async () => {
      const response = await axiosInstance.get("/notifications/unread-count")
      return response.data
    },

    markAllAsRead: async () => {
      await axiosInstance.post("/notifications/mark-all-read")
    },

    clearRead: async () => {
      await axiosInstance.delete("/notifications/clear-read")
    },
  },

  // Auth API
  auth: {
    login: async (email: string, password: string) => {
      const response = await axios.post(`${axiosInstance.defaults.baseURL}/auth/login`, {
        email,
        password,
      })
      return response.data
    },

    register: async (name: string, email: string, password: string) => {
      const response = await axios.post(`${axiosInstance.defaults.baseURL}/auth/register`, {
        name,
        email,
        password,
      })
      return response.data
    },
  },
}

export default api
