"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Mail, Phone, Home, Users, AlertCircle } from "lucide-react"
import { LinkParentDialog } from "./link-parent-dialog"

interface StudentManagementProps {
  students: any[]
}

export function StudentManagement({ students }: StudentManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [showLinkDialog, setShowLinkDialog] = useState(false)

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by student name, ID, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-center text-muted-foreground">No students found matching your criteria</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredStudents.map((student) => (
            <Card key={student._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{student.name}</CardTitle>
                    <CardDescription className="mt-1">
                      <Badge variant="outline">{student.studentId}</Badge>
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedStudent(student)
                      setShowLinkDialog(true)
                    }}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Manage Parents
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{student.email}</span>
                  </div>
                  {student.phoneNumber && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{student.phoneNumber}</span>
                    </div>
                  )}
                  {student.roomNumber && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Home className="h-4 w-4" />
                      <span>Room {student.roomNumber}</span>
                    </div>
                  )}
                </div>

                {student.parentIds && student.parentIds.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Linked Parents:</p>
                    <div className="space-y-1">
                      {student.parentIds.map((parent: any) => (
                        <div key={parent._id} className="rounded-md border bg-muted/50 p-2 text-sm">
                          <div className="font-medium">{parent.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {parent.email} • {parent.phoneNumber || "No phone"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="mb-1 inline h-4 w-4" /> No parents linked yet
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <LinkParentDialog open={showLinkDialog} onOpenChange={setShowLinkDialog} student={selectedStudent} />
    </div>
  )
}
