export const api = {
  baseUrl: "http://localhost:8080", // Change this to your backend URL

  // Helper function to handle API requests with authentication
  async fetch(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem("token")

    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/auth/login"
      throw new Error("Session expired. Please login again.")
    }

    return response
  },

  // Posts API
  posts: {
    getAll: async (page = 0, size = 10) => {
      const response = await api.fetch(`/posts?page=${page}&size=${size}`)
      return response.json()
    },

    getFeed: async (page = 0, size = 10) => {
      const response = await api.fetch(`/posts/feed?page=${page}&size=${size}`)
      return response.json()
    },

    getById: async (id: number) => {
      const response = await api.fetch(`/posts/${id}`)
      return response.json()
    },

    create: async (content: string, type: string, media?: File[]) => {
      const formData = new FormData()
      formData.append("content", content)
      formData.append("type", type)

      if (media) {
        media.forEach((file) => {
          formData.append("media", file)
        })
      }

      const response = await api.fetch("/posts", {
        method: "POST",
        body: formData,
        headers: {}, // Let the browser set the content type for FormData
      })

      return response.json()
    },

    update: async (id: number, content: string) => {
      const response = await api.fetch(`/posts/${id}`, {
        method: "PUT",
        body: JSON.stringify({ content }),
      })

      return response.json()
    },

    delete: async (id: number) => {
      await api.fetch(`/posts/${id}`, {
        method: "DELETE",
      })
    },

    like: async (id: number) => {
      const response = await api.fetch(`/posts/${id}/like`, {
        method: "POST",
      })

      return response.json()
    },

    unlike: async (id: number) => {
      const response = await api.fetch(`/posts/${id}/like`, {
        method: "DELETE",
      })

      return response.json()
    },
  },

  // Learning Plans API
  learningPlans: {
    getAll: async (page = 0, size = 10) => {
      const response = await api.fetch(`/learning-plans?page=${page}&size=${size}`)
      return response.json()
    },

    getMyPlans: async (page = 0, size = 10) => {
      const response = await api.fetch(`/learning-plans/my-plans?page=${page}&size=${size}`)
      return response.json()
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
      const response = await api.fetch("/learning-plans", {
        method: "POST",
        body: JSON.stringify(plan),
      })

      return response.json()
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
      const response = await api.fetch(`/learning-plans/${id}`, {
        method: "PUT",
        body: JSON.stringify(plan),
      })

      return response.json()
    },

    delete: async (id: number) => {
      await api.fetch(`/learning-plans/${id}`, {
        method: "DELETE",
      })
    },
  },

  // Users API
  users: {
    getCurrentUser: async () => {
      const response = await api.fetch("/users/me")
      return response.json()
    },

    getById: async (id: number) => {
      const response = await api.fetch(`/users/${id}`)
      return response.json()
    },

    updateProfile: async (data: { name: string; bio: string }) => {
      const response = await api.fetch("/users/me", {
        method: "PUT",
        body: JSON.stringify(data),
      })

      return response.json()
    },

    updateProfilePicture: async (file: File) => {
      const formData = new FormData()
      formData.append("file", file)

      const response = await api.fetch("/users/me/profile-picture", {
        method: "POST",
        body: formData,
        headers: {}, // Let the browser set the content type for FormData
      })

      return response.json()
    },

    follow: async (id: number) => {
      await api.fetch(`/users/${id}/follow`, {
        method: "POST",
      })
    },

    unfollow: async (id: number) => {
      await api.fetch(`/users/${id}/follow`, {
        method: "DELETE",
      })
    },

    search: async (query: string) => {
      const response = await api.fetch(`/users/search?query=${encodeURIComponent(query)}`)
      return response.json()
    },
  },

  // Notifications API
  notifications: {
    getAll: async (page = 0, size = 10) => {
      const response = await api.fetch(`/notifications?page=${page}&size=${size}`)
      return response.json()
    },

    getUnreadCount: async () => {
      const response = await api.fetch("/notifications/unread-count")
      return response.json()
    },

    markAllAsRead: async () => {
      await api.fetch("/notifications/mark-all-read", {
        method: "POST",
      })
    },

    clearRead: async () => {
      await api.fetch("/notifications/clear-read", {
        method: "DELETE",
      })
    },
  },
}
