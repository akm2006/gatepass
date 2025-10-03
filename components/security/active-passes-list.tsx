"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Clock, MapPin, User, LogIn, Search, AlertCircle } from "lucide-react"
import { format } from "date-fns"

interface ActivePassesListProps {
  gatePasses: any[]
}

export function ActivePassesList({ gatePasses }: ActivePassesListProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState<string | null>(null)

  const filteredGatePasses = gatePasses.filter((gatePass) => {
    const matchesSearch =
      gatePass.studentId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gatePass.studentId.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gatePass.destination.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  const handleCheckIn = async (gatePassId: string) => {
    setLoading(gatePassId)

    try {
      const response = await fetch("/api/gate-passes/checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gatePassId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to check in")
      }

      alert("Student checked in successfully!")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error checking in:", error)
      alert(error instanceof Error ? error.message : "Failed to check in")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by student name, ID, or destination..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredGatePasses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-center text-muted-foreground">
              {searchTerm ? "No active passes found matching your search" : "No students are currently out"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredGatePasses.map((gatePass) => (
            <Card key={gatePass._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{gatePass.studentId.name}</CardTitle>
                    <CardDescription>
                      <Badge variant="outline" className="mt-1">
                        {gatePass.studentId.studentId}
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Room {gatePass.studentId.roomNumber || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{gatePass.destination}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Checked out: {format(new Date(gatePass.checkOutTime), "MMM dd, hh:mm a")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Expected return: {format(new Date(gatePass.expectedReturnTime), "MMM dd, hh:mm a")}</span>
                  </div>
                </div>

                <div className="rounded-md bg-muted/50 p-3 text-sm">
                  <p className="font-medium">Reason</p>
                  <p className="text-muted-foreground">{gatePass.reason}</p>
                </div>

                <Button
                  onClick={() => handleCheckIn(gatePass._id)}
                  disabled={loading === gatePass._id}
                  className="w-full"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  {loading === gatePass._id ? "Processing..." : "Check In Student"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
