"use client"

import { useState } from "react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { UserButton } from "@/components/auth/user-button"
import { CreateGatePassDialog } from "./create-gate-pass-dialog"
import { GatePassList } from "./gate-pass-list"

interface StudentDashboardProps {
  user: any
  gatePasses: any[]
}

export function StudentDashboard({ user, gatePasses }: StudentDashboardProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold">Student Portal</h1>
            <p className="text-sm text-muted-foreground">
              {user.name} • {user.studentId}
            </p>
          </div>
          <UserButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">My Gate Passes</h2>
            <p className="text-sm text-muted-foreground">Request and track your gate passes</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </div>

        {user.parentIds && user.parentIds.length === 0 && (
          <Card className="mb-6 border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">No Parents Linked</CardTitle>
              <CardDescription>
                You need to have at least one parent linked to your account to request gate passes. Please contact the
                warden to link your parents.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <GatePassList gatePasses={gatePasses} />

        <CreateGatePassDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          hasParents={user.parentIds && user.parentIds.length > 0}
        />
      </main>
    </div>
  )
}
