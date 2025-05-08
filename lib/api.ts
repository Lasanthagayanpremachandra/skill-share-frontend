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
  // File upload utility
  files: {
    upload: async (file: File, type: "post-media" | "profile-picture" | "other" = "other") => {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", type)

      const response = await axiosInstance.post("/files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      return response.data.fileUrl // Return the URL of the uploaded file
    },
  },

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

    create: async (content: string, type: string, mediaUrls: string[] = []) => {
      // Use FormData instead of JSON for post creation
      const formData = new FormData()
      formData.append("content", content)
      formData.append("type", type)

      // Add media URLs if available
      if (mediaUrls.length > 0) {
        mediaUrls.forEach((url, index) => {
          formData.append(`mediaUrls[${index}]`, url)
        })
      }

      const response = await axiosInstance.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    },

    update: async (id: number, content: string, mediaUrls: string[] = []) => {
      // Use FormData for post updates as well
      const formData = new FormData()
      formData.append("content", content)

      // Add media URLs if available
      if (mediaUrls.length > 0) {
        mediaUrls.forEach((url, index) => {
          formData.append(`mediaUrls[${index}]`, url)
        })
      }

      const response = await axiosInstance.put(`/posts/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
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
      targetCompletionDate: string | null
      steps: Array<{
        title: string
        description: string
        resourceUrl?: string
      }>
    }) => {
      // Use JSON instead of FormData
      const response = await axiosInstance.post("/learning-plans", plan, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      return response.data
    },

    update: async (
      id: number,
      plan: {
        title: string
        description: string
        targetCompletionDate: string | null
        steps: Array<{
          title: string
          description: string
          resourceUrl?: string
        }>
      },
    ) => {
      // Use JSON instead of FormData
      const response = await axiosInstance.put(`/learning-plans/${id}`, plan, {
        headers: {
          "Content-Type": "application/json",
        },
      })
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

    updateProfile: async (data: { name: string; bio: string; profilePictureUrl?: string }) => {
      // Convert to FormData
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("bio", data.bio)

      if (data.profilePictureUrl) {
        formData.append("profilePictureUrl", data.profilePictureUrl)
      }

      const response = await axiosInstance.put("/users/me", formData, {
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
      // Use JSON instead of FormData
      const response = await axios.post(
        `${axiosInstance.defaults.baseURL}/auth/login`,
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
      return response.data
    },

    register: async (name: string, email: string, password: string) => {
      // Use JSON instead of FormData
      const response = await axios.post(
        `${axiosInstance.defaults.baseURL}/auth/register`,
        { name, email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
      return response.data
    },
  },
}

export default api
