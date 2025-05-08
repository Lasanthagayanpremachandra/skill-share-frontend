"use client"

import { Badge } from "@/components/ui/badge"
import type React from "react"
import { useEffect, useState } from "react"
import api from "@/lib/api"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageSquare, Plus, Share, ImageIcon } from 'lucide-react'
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import Link from "next/link"

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

interface LearningPlan {
  id: number
  title: string
  description: string
  status: string
  targetCompletionDate: string
  steps: Array<{
    id: number
    title: string
    description: string
    status: string
  }>
}

export default function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [learningPlans, setLearningPlans] = useState<LearningPlan[]>([])
  const [newPostContent, setNewPostContent] = useState("")
  const [isPostLoading, setIsPostLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("feed")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchFeed()
    fetchLearningPlans()
  }, [])

  const fetchFeed = async () => {
    try {
      const data = await api.posts.getFeed()
      setPosts(data.content || [])
    } catch (error) {
      console.error("Error fetching feed:", error)
      toast({
        title: "Error",
        description: "Failed to load feed. Please try again.",
        variant: "destructive",
      })
    }
  }

  const fetchLearningPlans = async () => {
    try {
      const data = await api.learningPlans.getMyPlans()
      setLearningPlans(data.content || [])
    } catch (error) {
      console.error("Error fetching learning plans:", error)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setSelectedFiles(filesArray)
    }
  }

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPostContent.trim()) return

    setIsPostLoading(true)
    try {
      // First, upload any files if present
      const mediaUrls: string[] = []

      if (selectedFiles.length > 0) {
        setUploadingFiles(true)
        for (const file of selectedFiles) {
          try {
            const fileUrl = await api.files.upload(file, "post-media")
            mediaUrls.push(fileUrl)
          } catch (error) {
            console.error("Error uploading file:", error)
            toast({
              title: "Error",
              description: "Failed to upload file. Please try again.",
              variant: "destructive",
            })
          }
        }
        setUploadingFiles(false)
      }

      // Then create the post with the file URLs
      await api.posts.create(newPostContent, "SKILL_SHARING", mediaUrls)
      setNewPostContent("")
      setSelectedFiles([])
      toast({
        title: "Success",
        description: "Post created successfully!",
      })
      fetchFeed()
    } catch (error) {
      console.error("Error creating post:", error)
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsPostLoading(false)
    }
  }

  const handleLikePost = async (postId: number) => {
    try {
      await api.posts.like(postId)
      fetchFeed()
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Tabs defaultValue="feed" value={activeTab} onValueChange={setActiveTab}>
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="feed">Feed</TabsTrigger>
                  <TabsTrigger value="discover">Discover</TabsTrigger>
                </TabsList>
                <Link href="/posts/create">
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    New Post
                  </Button>
                </Link>
              </div>
              <TabsContent value="feed" className="mt-4 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Create Post</CardTitle>
                    <CardDescription>Share your skills or progress with the community</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreatePost}>
                      <div className="space-y-4">
                        <Textarea
                          placeholder="What skill are you sharing today?"
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                          className="min-h-[100px]"
                        />
                        <div className="flex items-center">
                          <label htmlFor="post-media" className="cursor-pointer">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                              <ImageIcon className="h-4 w-4" />
                              <span>Add Image</span>
                            </div>
                            <input
                              id="post-media"
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={handleFileChange}
                            />
                          </label>
                          {selectedFiles.length > 0 && (
                            <span className="ml-2 text-sm text-muted-foreground">
                              {selectedFiles.length} file(s) selected
                            </span>
                          )}
                        </div>
                        <div className="flex justify-end">
                          <Button type="submit" disabled={isPostLoading || uploadingFiles || !newPostContent.trim()}>
                            {isPostLoading || uploadingFiles ? "Posting..." : "Post"}
                          </Button>
                        </div>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {posts.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-6">
                      <p className="text-center text-muted-foreground">
                        Your feed is empty. Follow users or create a post to see content here.
                      </p>
                      <Button variant="outline" className="mt-4" onClick={() => setActiveTab("discover")}>
                        Discover Users
                      </Button>
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
              </TabsContent>
              <TabsContent value="discover" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Discover Users</CardTitle>
                    <CardDescription>Find and follow users with similar interests</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* User discovery content would go here */}
                    <p className="text-center py-4 text-muted-foreground">User discovery feature coming soon!</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Learning Plans</CardTitle>
                <CardDescription>Track your learning progress</CardDescription>
              </CardHeader>
              <CardContent>
                {learningPlans.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">You don't have any learning plans yet.</p>
                    <Link href="/learning-plans/create">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Plan
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {learningPlans.slice(0, 3).map((plan) => (
                      <div key={plan.id} className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{plan.title}</h4>
                          <p className="text-xs text-muted-foreground">Status: {plan.status.replace("_", " ")}</p>
                        </div>
                        <Link href={`/learning-plans/${plan.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                      </div>
                    ))}
                    <div className="pt-2">
                      <Link href="/learning-plans">
                        <Button variant="outline" className="w-full">
                          View All Plans
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Suggested Skills</CardTitle>
                <CardDescription>Popular skills you might want to learn</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">JavaScript</Badge>
                  <Badge variant="secondary">React</Badge>
                  <Badge variant="secondary">UI Design</Badge>
                  <Badge variant="secondary">Data Science</Badge>
                  <Badge variant="secondary">Machine Learning</Badge>
                  <Badge variant="secondary">Public Speaking</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
