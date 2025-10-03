"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserButton } from "@/components/auth/user-button"
import { WardenGatePassList } from "./warden-gate-pass-list"
import { StudentManagement } from "./student-management"
import { BarChart3, Users } from "lucide-react"

interface WardenDashboardProps {
  user: any
  gatePasses: any[]
  students: any[]
}

export function WardenDashboard({ user, gatePasses, students }: WardenDashboardProps) {
  const [activeTab, setActiveTab] = useState("gate-passes")

  const pendingCount = gatePasses.filter((gp) => gp.status === "pending").length
  const approvedCount = gatePasses.filter((gp) => gp.status === "approved").length
  const activeCount = gatePasses.filter((gp) => gp.status === "active").length

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold">Warden Portal</h1>
            <p className="text-sm text-muted-foreground">{user.name}</p>
          </div>
          <UserButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
              <div className="rounded-full bg-secondary p-3">
                <BarChart3 className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved Passes</p>
                <p className="text-2xl font-bold">{approvedCount}</p>
              </div>
              <div className="rounded-full bg-secondary p-3">
                <BarChart3 className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Currently Out</p>
                <p className="text-2xl font-bold">{activeCount}</p>
              </div>
              <div className="rounded-full bg-secondary p-3">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="gate-passes">Gate Passes</TabsTrigger>
            <TabsTrigger value="students">Student Management</TabsTrigger>
          </TabsList>

          <TabsContent value="gate-passes">
            <WardenGatePassList gatePasses={gatePasses} />
          </TabsContent>

          <TabsContent value="students">
            <StudentManagement students={students} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
