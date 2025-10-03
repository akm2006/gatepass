"use client"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserButton } from "@/components/auth/user-button"
import { ParentGatePassList } from "./parent-gate-pass-list"
import { AlertCircle } from "lucide-react"

interface ParentDashboardProps {
  user: any
  gatePasses: any[]
}

export function ParentDashboard({ user, gatePasses }: ParentDashboardProps) {
  // Filter for pending approvals that need this parent's action
  const pendingApprovals = gatePasses.filter((gatePass) => {
    const currentApproval = gatePass.parentApprovals[gatePass.currentApprovalIndex]
    return (
      currentApproval &&
      currentApproval.parentId._id === user._id &&
      currentApproval.status === "pending" &&
      gatePass.status === "pending"
    )
  })

  const allRequests = gatePasses

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold">Parent Portal</h1>
            <p className="text-sm text-muted-foreground">{user.name}</p>
          </div>
          <UserButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {user.childIds && user.childIds.length === 0 && (
          <Card className="mb-6 border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                No Children Linked
              </CardTitle>
              <CardDescription>
                You don't have any children linked to your account yet. Please contact the warden to link your child's
                account.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <div className="mb-6">
          <h2 className="text-xl font-semibold">Pending Approvals</h2>
          <p className="text-sm text-muted-foreground">Gate pass requests waiting for your approval</p>
        </div>

        {pendingApprovals.length > 0 ? (
          <div className="mb-8">
            <ParentGatePassList gatePasses={pendingApprovals} showActions={true} parentId={user._id} />
          </div>
        ) : (
          <Card className="mb-8">
            <CardHeader>
              <CardDescription className="text-center">No pending approvals at the moment</CardDescription>
            </CardHeader>
          </Card>
        )}

        <div className="mb-6 mt-8">
          <h2 className="text-xl font-semibold">All Requests</h2>
          <p className="text-sm text-muted-foreground">View all gate pass requests from your children</p>
        </div>

        {allRequests.length > 0 ? (
          <ParentGatePassList gatePasses={allRequests} showActions={false} parentId={user._id} />
        ) : (
          <Card>
            <CardHeader>
              <CardDescription className="text-center">No gate pass requests yet</CardDescription>
            </CardHeader>
          </Card>
        )}
      </main>
    </div>
  )
}
