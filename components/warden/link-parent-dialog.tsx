"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

interface LinkParentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student: any
}

export function LinkParentDialog({ open, onOpenChange, student }: LinkParentDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [parentEmail, setParentEmail] = useState("")

  if (!student) return null

  const handleLinkParent = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/users/link-parent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: student._id,
          parentEmail,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to link parent")
      }

      alert("Parent linked successfully!")
      setParentEmail("")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error linking parent:", error)
      alert(error instanceof Error ? error.message : "Failed to link parent")
    } finally {
      setLoading(false)
    }
  }

  const handleUnlinkParent = async (parentId: string) => {
    if (!confirm("Are you sure you want to unlink this parent?")) return

    setLoading(true)

    try {
      const response = await fetch("/api/users/unlink-parent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: student._id,
          parentId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to unlink parent")
      }

      alert("Parent unlinked successfully!")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error unlinking parent:", error)
      alert(error instanceof Error ? error.message : "Failed to unlink parent")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Parents for {student.name}</DialogTitle>
          <DialogDescription>Link or unlink parents for this student</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {student.parentIds && student.parentIds.length > 0 && (
            <div className="space-y-2">
              <Label>Currently Linked Parents:</Label>
              <div className="space-y-2">
                {student.parentIds.map((parent: any) => (
                  <div key={parent._id} className="flex items-center justify-between rounded-md border p-2">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{parent.name}</div>
                      <div className="text-xs text-muted-foreground">{parent.email}</div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleUnlinkParent(parent._id)} disabled={loading}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleLinkParent} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="parentEmail">Link New Parent</Label>
              <Input
                id="parentEmail"
                type="email"
                placeholder="parent@example.com"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter the email address of a parent account to link them to this student
              </p>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Close
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Linking..." : "Link Parent"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
