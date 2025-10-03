"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, MapPin, User, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ParentGatePassListProps {
  gatePasses: any[]
  showActions: boolean
  parentId: string
}

export function ParentGatePassList({ gatePasses, showActions, parentId }: ParentGatePassListProps) {
  const router = useRouter()
  const [selectedGatePass, setSelectedGatePass] = useState<any>(null)
  const [action, setAction] = useState<"approve" | "reject" | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAction = async () => {
    if (!selectedGatePass || !action) return

    setLoading(true)

    try {
      const response = await fetch("/api/gate-passes/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gatePassId: selectedGatePass._id,
          action,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to process approval")
      }

      const result = await response.json()
      alert(result.message)
      setSelectedGatePass(null)
      setAction(null)
      router.refresh()
    } catch (error) {
      console.error("[v0] Error processing approval:", error)
      alert(error instanceof Error ? error.message : "Failed to process approval")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="space-y-4">
        {gatePasses.map((gatePass) => {
          const currentApproval = gatePass.parentApprovals.find((approval: any) => approval.parentId._id === parentId)
          const isCurrentApprover = gatePass.parentApprovals[gatePass.currentApprovalIndex]?.parentId._id === parentId

          return (
            <Card key={gatePass._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{gatePass.reason}</CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {gatePass.destination}
                    </CardDescription>
                  </div>
                  <StatusBadge status={gatePass.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>
                    {gatePass.studentId.name} ({gatePass.studentId.studentId})
                  </span>
                </div>

                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Departure: {format(new Date(gatePass.departureTime), "MMM dd, yyyy 'at' hh:mm a")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      Expected Return: {format(new Date(gatePass.expectedReturnTime), "MMM dd, yyyy 'at' hh:mm a")}
                    </span>
                  </div>
                </div>

                {gatePass.parentApprovals && gatePass.parentApprovals.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Approval Chain:</p>
                    <div className="space-y-1">
                      {gatePass.parentApprovals.map((approval: any, index: number) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between rounded-md border p-2 text-sm ${
                            approval.parentId._id === parentId ? "border-primary bg-primary/5" : ""
                          }`}
                        >
                          <span className="text-muted-foreground">
                            {approval.parentId.name}
                            {approval.parentId._id === parentId && " (You)"}
                          </span>
                          <ApprovalStatusBadge status={approval.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentApproval && currentApproval.status === "pending" && (
                  <div className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
                    {isCurrentApprover ? (
                      <span className="font-medium text-foreground">Your approval is required</span>
                    ) : (
                      <span>Waiting for approval from previous parent in the chain</span>
                    )}
                  </div>
                )}

                {showActions && isCurrentApprover && currentApproval?.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                      onClick={() => {
                        setSelectedGatePass(gatePass)
                        setAction("reject")
                      }}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => {
                        setSelectedGatePass(gatePass)
                        setAction("approve")
                      }}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <AlertDialog open={!!selectedGatePass && !!action} onOpenChange={() => setSelectedGatePass(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{action === "approve" ? "Approve Gate Pass?" : "Reject Gate Pass?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {action === "approve" ? (
                <>
                  You are about to approve the gate pass request for{" "}
                  <strong>{selectedGatePass?.studentId?.name}</strong>.
                  {selectedGatePass?.parentApprovals &&
                  selectedGatePass.currentApprovalIndex < selectedGatePass.parentApprovals.length - 1
                    ? " The request will then be sent to the next parent for approval."
                    : " This is the final approval needed, and the student will receive their gate pass."}
                </>
              ) : (
                <>
                  You are about to reject the gate pass request for <strong>{selectedGatePass?.studentId?.name}</strong>
                  . This action cannot be undone and the student will need to submit a new request.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAction} disabled={loading}>
              {loading ? "Processing..." : action === "approve" ? "Approve" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { variant: any; icon: any; label: string }> = {
    pending: { variant: "secondary", icon: Clock, label: "Pending" },
    approved: { variant: "default", icon: CheckCircle2, label: "Approved" },
    rejected: { variant: "destructive", icon: XCircle, label: "Rejected" },
    expired: { variant: "outline", icon: AlertCircle, label: "Expired" },
    active: { variant: "default", icon: CheckCircle2, label: "Active" },
    completed: { variant: "outline", icon: CheckCircle2, label: "Completed" },
  }

  const config = variants[status] || variants.pending
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}

function ApprovalStatusBadge({ status }: { status: string }) {
  const variants: Record<string, { variant: any; label: string }> = {
    pending: { variant: "secondary", label: "Pending" },
    approved: { variant: "default", label: "Approved" },
    rejected: { variant: "destructive", label: "Rejected" },
    expired: { variant: "outline", label: "Expired" },
  }

  const config = variants[status] || variants.pending

  return <Badge variant={config.variant}>{config.label}</Badge>
}
