"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageSquare, Share, Search } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Post {
  id: number
  content: string
  type: string
  user: {
    id: number
    name: string
    profilePicture?: string
  }
  createdAt: string
  likes: any[]
  comments: any[]
  mediaUrls?: string[]
}

interface User {
  id: number
  name: string
  email: string
  bio?: string
  profilePicture?: string
}

export default function ExplorePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchAllPosts()
  }, [])

  const fetchAllPosts = async () => {
    setIsLoading(true)
    try {
      const data = await api.posts.getAll()
      setPosts(data.content || [])
    } catch (error) {
      console.error("Error fetching posts:", error)
      toast({
        title: "Error",
        description: "Failed to load posts. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    try {
      const users = await api.users.search(searchQuery)
      setUsers(users || [])
    } catch (error) {
      console.error("Error searching users:", error)
      toast({
        title: "Error",
        description: "Failed to search users. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLikePost = async (postId: number) => {
    try {
      await api.posts.like(postId)
      fetchAllPosts()
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  return (
    <DashboardLayout>
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Explore</h1>

        <Tabs defaultValue="posts">
          <TabsList className="mb-4">
            <TabsTrigger value="posts">All Posts</TabsTrigger>
            <TabsTrigger value="users">Find Users</TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : posts.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <h3 className="text-xl font-semibold mb-2">No Posts Yet</h3>
                    <p className="text-center text-muted-foreground mb-6">
                      Be the first to share your skills with the community!
                    </p>
                    <Link href="/dashboard">
                      <Button>Create a Post</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
                  <Card key={post.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-4">
                        <Avatar>
                          <AvatarImage src={post.user?.profilePicture || "/placeholder.svg"} />
                          <AvatarFallback>{post.user?.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{post.user?.name || "Unknown User"}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(post.createdAt), "MMM d, yyyy")}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm">{post.content}</p>

                          {/* Display media if available */}
                          {post.mediaUrls && post.mediaUrls.length > 0 && (
                            <div className="mt-2 grid gap-2 grid-cols-2">
                              {post.mediaUrls.map((url, index) => (
                                <img
                                  key={index}
                                  src={url || "/placeholder.svg"}
                                  alt={`Post media ${index + 1}`}
                                  className="rounded-md max-h-64 w-auto object-cover"
                                />
                              ))}
                            </div>
                          )}

                          <div className="flex items-center space-x-4 pt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center space-x-1"
                              onClick={() => handleLikePost(post.id)}
                            >
                              <Heart className="h-4 w-4" />
                              <span>{post.likes?.length || 0}</span>
                            </Button>
                            <Link href={`/posts/${post.id}`}>
                              <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                                <MessageSquare className="h-4 w-4" />
                                <span>{post.comments?.length || 0}</span>
                              </Button>
                            </Link>
                            <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                              <Share className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Find Users</CardTitle>
                <CardDescription>Search for users to follow and connect with</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2 mb-6">
                  <Input
                    placeholder="Search by name or email"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <Button onClick={handleSearch} disabled={!searchQuery.trim()}>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>

                {isLoading && searchQuery ? (
                  <div className="flex justify-center py-6">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  </div>
                ) : users.length > 0 ? (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={user.profilePicture || "/placeholder.svg"} />
                            <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name || "Unknown User"}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => api.users.follow(user.id)}>
                          Follow
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : searchQuery ? (
                  <p className="text-center py-6 text-muted-foreground">No users found matching your search.</p>
                ) : (
                  <p className="text-center py-6 text-muted-foreground">
                    Search for users by name or email to connect with them.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
