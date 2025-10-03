"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, CheckCircle2, XCircle, AlertCircle, QrCode } from "lucide-react"
import { format } from "date-fns"
import { GatePassQRCode } from "./gate-pass-qr-code"

interface GatePassListProps {
  gatePasses: any[]
}

export function GatePassList({ gatePasses }: GatePassListProps) {
  if (gatePasses.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-center text-muted-foreground">No gate passes yet. Create your first request!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {gatePasses.map((gatePass) => (
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
                <p className="text-sm font-medium">Parent Approvals:</p>
                <div className="space-y-1">
                  {gatePass.parentApprovals.map((approval: any, index: number) => (
                    <div key={index} className="flex items-center justify-between rounded-md border p-2 text-sm">
                      <span className="text-muted-foreground">
                        {approval.parentId?.name || "Parent"} ({approval.parentId?.email || "N/A"})
                      </span>
                      <ApprovalStatusBadge status={approval.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {gatePass.status === "approved" && gatePass.qrCode && (
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <QrCode className="h-4 w-4" />
                  <span className="text-sm font-medium">Your Gate Pass QR Code</span>
                </div>
                <GatePassQRCode value={gatePass.qrCode} />
                <p className="mt-2 text-xs text-muted-foreground">
                  Show this QR code to the security guard for check-out
                </p>
              </div>
            )}

            {gatePass.checkOutTime && (
              <div className="text-sm text-muted-foreground">
                Checked out: {format(new Date(gatePass.checkOutTime), "MMM dd, yyyy 'at' hh:mm a")}
              </div>
            )}

            {gatePass.checkInTime && (
              <div className="text-sm text-muted-foreground">
                Checked in: {format(new Date(gatePass.checkInTime), "MMM dd, yyyy 'at' hh:mm a")}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
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
