"use client"

import Link from "next/link"

import type React from "react"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"

export default function ProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [userPosts, setUserPosts] = useState([])
  const [userLearningPlans, setUserLearningPlans] = useState([])

  useEffect(() => {
    if (user) {
      setName(user.name || "")
      setBio(user.bio || "")
      fetchUserPosts()
      fetchUserLearningPlans()
    }
  }, [user])

  const fetchUserPosts = async () => {
    try {
      const response = await api.fetch(`/posts?userId=${user?.id}`)
      const data = await response.json()
      setUserPosts(data.content || [])
    } catch (error) {
      console.error("Error fetching user posts:", error)
    }
  }

  const fetchUserLearningPlans = async () => {
    try {
      const data = await api.learningPlans.getMyPlans()
      setUserLearningPlans(data.content || [])
    } catch (error) {
      console.error("Error fetching user learning plans:", error)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await api.users.updateProfile({ name, bio })
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      await api.users.updateProfilePicture(file)
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating profile picture:", error)
      toast({
        title: "Update failed",
        description: "Failed to update profile picture. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Manage your personal information</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="relative mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user?.profilePicture || ""} alt={user?.name || ""} />
                    <AvatarFallback className="text-2xl">{user?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="profile-picture"
                    className="absolute -bottom-2 -right-2 cursor-pointer rounded-full bg-primary p-1 text-primary-foreground"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                    </svg>
                    <span className="sr-only">Change profile picture</span>
                    <Input
                      id="profile-picture"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePictureChange}
                    />
                  </label>
                </div>
                <h3 className="text-xl font-bold">{user?.name}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2">
            <Tabs defaultValue="edit">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="edit">Edit Profile</TabsTrigger>
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="plans">Learning Plans</TabsTrigger>
              </TabsList>
              <TabsContent value="edit" className="mt-4">
                <Card>
                  <form onSubmit={handleUpdateProfile}>
                    <CardHeader>
                      <CardTitle>Edit Profile</CardTitle>
                      <CardDescription>Update your personal information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={user?.email || ""} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Tell us about yourself"
                          className="min-h-[100px]"
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save Changes"}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
              <TabsContent value="posts" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>My Posts</CardTitle>
                    <CardDescription>Posts you've shared with the community</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userPosts.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">You haven't created any posts yet.</p>
                        <Button className="mt-4" variant="outline" asChild>
                          <Link href="/dashboard">Create a Post</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {userPosts.map((post: any) => (
                          <div key={post.id} className="border-b pb-4 last:border-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{post.content}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(post.createdAt), "MMM d, yyyy")}
                                </p>
                              </div>
                              <Link href={`/posts/${post.id}`}>
                                <Button variant="ghost" size="sm">
                                  View
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="plans" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>My Learning Plans</CardTitle>
                    <CardDescription>Your personal learning journey</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userLearningPlans.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">You haven't created any learning plans yet.</p>
                        <Button className="mt-4" variant="outline" asChild>
                          <Link href="/learning-plans/create">Create a Plan</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {userLearningPlans.map((plan: any) => (
                          <div key={plan.id} className="border-b pb-4 last:border-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{plan.title}</p>
                                <p className="text-xs text-muted-foreground">Status: {plan.status.replace("_", " ")}</p>
                              </div>
                              <Link href={`/learning-plans/${plan.id}`}>
                                <Button variant="ghost" size="sm">
                                  View
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
