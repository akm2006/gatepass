"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScanLine, LogOut, LogIn, User, MapPin, Clock } from "lucide-react"
import { format } from "date-fns"

export function QRScanner() {
  const router = useRouter()
  const [gatePassId, setGatePassId] = useState("")
  const [loading, setLoading] = useState(false)
  const [gatePassInfo, setGatePassInfo] = useState<any>(null)
  const [error, setError] = useState("")

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setGatePassInfo(null)

    try {
      const response = await fetch(`/api/gate-passes/${gatePassId}`)

      if (!response.ok) {
        throw new Error("Gate pass not found")
      }

      const data = await response.json()
      setGatePassInfo(data.gatePass)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch gate pass")
    } finally {
      setLoading(false)
    }
  }

  const handleCheckOut = async () => {
    if (!gatePassInfo) return

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/gate-passes/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gatePassId: gatePassInfo._id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to check out")
      }

      alert("Student checked out successfully!")
      setGatePassId("")
      setGatePassInfo(null)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check out")
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async () => {
    if (!gatePassInfo) return

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/gate-passes/checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gatePassId: gatePassInfo._id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to check in")
      }

      alert("Student checked in successfully!")
      setGatePassId("")
      setGatePassInfo(null)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check in")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScanLine className="h-5 w-5" />
            Scan Gate Pass
          </CardTitle>
          <CardDescription>Enter the gate pass ID from the QR code to verify and process</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleScan} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gatePassId">Gate Pass ID</Label>
              <Input
                id="gatePassId"
                placeholder="Enter gate pass ID..."
                value={gatePassId}
                onChange={(e) => setGatePassId(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                In a real implementation, this would scan the QR code. For now, manually enter the gate pass ID.
              </p>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Scanning..." : "Verify Gate Pass"}
            </Button>
          </form>

          {error && (
            <div className="mt-4 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {gatePassInfo && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle>Gate Pass Details</CardTitle>
              <StatusBadge status={gatePassInfo.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">{gatePassInfo.studentId.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {gatePassInfo.studentId.studentId} • Room {gatePassInfo.studentId.roomNumber || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Destination</p>
                  <p className="text-sm text-muted-foreground">{gatePassInfo.destination}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Departure Time</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(gatePassInfo.departureTime), "MMM dd, yyyy 'at' hh:mm a")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Expected Return</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(gatePassInfo.expectedReturnTime), "MMM dd, yyyy 'at' hh:mm a")}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-sm font-medium">Reason</p>
                <p className="text-sm text-muted-foreground">{gatePassInfo.reason}</p>
              </div>
            </div>

            {gatePassInfo.status === "approved" && (
              <Button onClick={handleCheckOut} disabled={loading} className="w-full" size="lg">
                <LogOut className="mr-2 h-5 w-5" />
                {loading ? "Processing..." : "Check Out Student"}
              </Button>
            )}

            {gatePassInfo.status === "active" && (
              <div className="space-y-3">
                <div className="rounded-md bg-muted/50 p-3 text-sm">
                  <p className="font-medium">Checked Out</p>
                  <p className="text-muted-foreground">
                    {format(new Date(gatePassInfo.checkOutTime), "MMM dd, yyyy 'at' hh:mm a")}
                  </p>
                </div>
                <Button onClick={handleCheckIn} disabled={loading} className="w-full" size="lg">
                  <LogIn className="mr-2 h-5 w-5" />
                  {loading ? "Processing..." : "Check In Student"}
                </Button>
              </div>
            )}

            {gatePassInfo.status === "completed" && (
              <div className="space-y-2 rounded-md bg-muted/50 p-3 text-sm">
                <div>
                  <p className="font-medium">Checked Out</p>
                  <p className="text-muted-foreground">
                    {format(new Date(gatePassInfo.checkOutTime), "MMM dd, yyyy 'at' hh:mm a")}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Checked In</p>
                  <p className="text-muted-foreground">
                    {format(new Date(gatePassInfo.checkInTime), "MMM dd, yyyy 'at' hh:mm a")}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { variant: any; label: string }> = {
    approved: { variant: "default", label: "Ready for Check-out" },
    active: { variant: "default", label: "Currently Out" },
    completed: { variant: "outline", label: "Completed" },
  }

  const config = variants[status] || { variant: "secondary", label: status }

  return <Badge variant={config.variant}>{config.label}</Badge>
}
