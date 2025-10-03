"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface CreateGatePassDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hasParents: boolean
}

export function CreateGatePassDialog({ open, onOpenChange, hasParents }: CreateGatePassDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    reason: "",
    destination: "",
    departureTime: "",
    expectedReturnTime: "",
  })

  const isFormValid = () => {
    return (
      formData.reason.trim() !== "" &&
      formData.destination.trim() !== "" &&
      formData.departureTime !== "" &&
      formData.expectedReturnTime !== ""
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!hasParents) {
      alert("You need to have at least one parent linked to request a gate pass.")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/gate-passes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create gate pass")
      }

      alert("Gate pass request submitted successfully!")
      setFormData({
        reason: "",
        destination: "",
        departureTime: "",
        expectedReturnTime: "",
      })
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error("[v0] Error creating gate pass:", error)
      alert(error instanceof Error ? error.message : "Failed to create gate pass")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request Gate Pass</DialogTitle>
          <DialogDescription>Fill in the details for your gate pass request</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Leave</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="e.g., Medical appointment, Family emergency"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <Input
              id="destination"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              placeholder="e.g., City Hospital, Home"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="departureTime">Departure Time</Label>
            <Input
              id="departureTime"
              type="datetime-local"
              value={formData.departureTime}
              onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expectedReturnTime">Expected Return Time</Label>
            <Input
              id="expectedReturnTime"
              type="datetime-local"
              value={formData.expectedReturnTime}
              onChange={(e) => setFormData({ ...formData, expectedReturnTime: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !hasParents || !isFormValid()} className="flex-1">
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
