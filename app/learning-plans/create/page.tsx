"use client"

import type React from "react"

import { useState } from "react"
import { api } from "@/lib/api"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"

interface LearningStep {
  title: string
  description: string
  resourceUrl?: string
}

export default function CreateLearningPlanPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [targetCompletionDate, setTargetCompletionDate] = useState("")
  const [steps, setSteps] = useState<LearningStep[]>([{ title: "", description: "", resourceUrl: "" }])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleAddStep = () => {
    setSteps([...steps, { title: "", description: "", resourceUrl: "" }])
  }

  const handleRemoveStep = (index: number) => {
    if (steps.length === 1) return
    const newSteps = [...steps]
    newSteps.splice(index, 1)
    setSteps(newSteps)
  }

  const handleStepChange = (index: number, field: keyof LearningStep, value: string) => {
    const newSteps = [...steps]
    newSteps[index] = { ...newSteps[index], [field]: value }
    setSteps(newSteps)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!title.trim() || !description.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and description are required.",
        variant: "destructive",
      })
      return
    }

    // Validate steps
    const validSteps = steps.filter((step) => step.title.trim() && step.description.trim())
    if (validSteps.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one valid step is required.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await api.learningPlans.create({
        title,
        description,
        targetCompletionDate: targetCompletionDate || null,
        steps: validSteps,
      })

      toast({
        title: "Success",
        description: "Learning plan created successfully!",
      })

      router.push("/learning-plans")
    } catch (error) {
      console.error("Error creating learning plan:", error)
      toast({
        title: "Error",
        description: "Failed to create learning plan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Create Learning Plan</h1>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Plan Details</CardTitle>
              <CardDescription>Define your learning objectives and timeline</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Learn JavaScript Fundamentals"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your learning goals and what you want to achieve"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetDate">Target Completion Date (Optional)</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={targetCompletionDate}
                  onChange={(e) => setTargetCompletionDate(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Learning Steps</CardTitle>
              <CardDescription>Break down your learning plan into manageable steps</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {steps.map((step, index) => (
                <div key={index} className="space-y-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Step {index + 1}</h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveStep(index)}
                      disabled={steps.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`step-title-${index}`}>Title</Label>
                    <Input
                      id={`step-title-${index}`}
                      placeholder="e.g., Learn Variables and Data Types"
                      value={step.title}
                      onChange={(e) => handleStepChange(index, "title", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`step-description-${index}`}>Description</Label>
                    <Textarea
                      id={`step-description-${index}`}
                      placeholder="Describe what you'll learn in this step"
                      value={step.description}
                      onChange={(e) => handleStepChange(index, "description", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`step-resource-${index}`}>Resource URL (Optional)</Label>
                    <Input
                      id={`step-resource-${index}`}
                      placeholder="e.g., https://example.com/tutorial"
                      value={step.resourceUrl}
                      onChange={(e) => handleStepChange(index, "resourceUrl", e.target.value)}
                    />
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" className="w-full" onClick={handleAddStep}>
                <Plus className="mr-2 h-4 w-4" />
                Add Step
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.push("/learning-plans")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Learning Plan"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
