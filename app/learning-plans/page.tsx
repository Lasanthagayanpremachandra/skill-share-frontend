"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface LearningPlan {
  id: number
  title: string
  description: string
  status: string
  targetCompletionDate: string
  steps: Array<{
    id: number
    title: string
    status: string
  }>
}

export default function LearningPlansPage() {
  const [learningPlans, setLearningPlans] = useState<LearningPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchLearningPlans()
  }, [])

  const fetchLearningPlans = async () => {
    setIsLoading(true)
    try {
      const data = await api.learningPlans.getMyPlans()
      setLearningPlans(data.content || [])
    } catch (error) {
      console.error("Error fetching learning plans:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      case "ON_HOLD":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
    }
  }

  const getCompletionPercentage = (steps: any[]) => {
    if (!steps.length) return 0
    const completedSteps = steps.filter((step) => step.status === "COMPLETED").length
    return Math.round((completedSteps / steps.length) * 100)
  }

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Learning Plans</h1>
          <Link href="/learning-plans/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Plan
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : learningPlans.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <h3 className="text-xl font-semibold mb-2">No Learning Plans Yet</h3>
              <p className="text-center text-muted-foreground mb-6">
                Create your first learning plan to track your skills development journey.
              </p>
              <Link href="/learning-plans/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Plan
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {learningPlans.map((plan) => (
              <Card key={plan.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{plan.title}</CardTitle>
                    <Badge className={getStatusColor(plan.status)}>{plan.status.replace("_", " ")}</Badge>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      Target:{" "}
                      {plan.targetCompletionDate
                        ? format(new Date(plan.targetCompletionDate), "MMM d, yyyy")
                        : "Not set"}
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm font-medium">{getCompletionPercentage(plan.steps)}%</span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${getCompletionPercentage(plan.steps)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Steps ({plan.steps.length})</h4>
                      <ul className="space-y-1">
                        {plan.steps.slice(0, 3).map((step) => (
                          <li key={step.id} className="flex items-center text-sm">
                            {step.status === "COMPLETED" ? (
                              <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                            ) : (
                              <div className="mr-2 h-4 w-4 rounded-full border border-muted-foreground"></div>
                            )}
                            <span className={step.status === "COMPLETED" ? "line-through text-muted-foreground" : ""}>
                              {step.title}
                            </span>
                          </li>
                        ))}
                        {plan.steps.length > 3 && (
                          <li className="text-sm text-muted-foreground">+{plan.steps.length - 3} more steps</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/learning-plans/${plan.id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
