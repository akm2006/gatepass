"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, MapPin, User, CheckCircle2, XCircle, AlertCircle, Search } from "lucide-react"
import { format } from "date-fns"

interface WardenGatePassListProps {
  gatePasses: any[]
}

export function WardenGatePassList({ gatePasses }: WardenGatePassListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredGatePasses = gatePasses.filter((gatePass) => {
    const matchesSearch =
      gatePass.studentId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gatePass.studentId.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gatePass.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gatePass.destination.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || gatePass.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by student name, ID, reason, or destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredGatePasses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-center text-muted-foreground">No gate passes found matching your criteria</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredGatePasses.map((gatePass) => (
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
                <div className="grid gap-3 rounded-lg border bg-muted/50 p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{gatePass.studentId.name}</span>
                    <Badge variant="outline" className="ml-auto">
                      {gatePass.studentId.studentId}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-xs">Room: {gatePass.studentId.roomNumber || "N/A"}</span>
                    <span className="text-xs">•</span>
                    <span className="text-xs">{gatePass.studentId.email}</span>
                  </div>
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
                    <p className="text-sm font-medium">Parent Approvals:</p>
                    <div className="space-y-1">
                      {gatePass.parentApprovals.map((approval: any, index: number) => (
                        <div key={index} className="flex items-center justify-between rounded-md border p-2 text-sm">
                          <div className="flex-1">
                            <span className="font-medium">{approval.parentId.name}</span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              {approval.parentId.email} • {approval.parentId.phoneNumber || "No phone"}
                            </span>
                          </div>
                          <ApprovalStatusBadge status={approval.status} />
                        </div>
                      ))}
                    </div>
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

                <div className="text-xs text-muted-foreground">
                  Requested: {format(new Date(gatePass.createdAt), "MMM dd, yyyy 'at' hh:mm a")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
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
