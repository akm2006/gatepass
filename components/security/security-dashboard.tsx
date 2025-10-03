"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserButton } from "@/components/auth/user-button"
import { QRScanner } from "./qr-scanner"
import { ActivePassesList } from "./active-passes-list"
import { ScanLine, List } from "lucide-react"

interface SecurityDashboardProps {
  user: any
  gatePasses: any[]
}

export function SecurityDashboard({ user, gatePasses }: SecurityDashboardProps) {
  const [activeTab, setActiveTab] = useState("scanner")

  const approvedPasses = gatePasses.filter((gp) => gp.status === "approved")
  const activePasses = gatePasses.filter((gp) => gp.status === "active")

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold">Security Portal</h1>
            <p className="text-sm text-muted-foreground">{user.name}</p>
          </div>
          <UserButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ready for Check-out</p>
                <p className="text-2xl font-bold">{approvedPasses.length}</p>
              </div>
              <div className="rounded-full bg-secondary p-3">
                <ScanLine className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Currently Out</p>
                <p className="text-2xl font-bold">{activePasses.length}</p>
              </div>
              <div className="rounded-full bg-secondary p-3">
                <List className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="scanner">QR Scanner</TabsTrigger>
            <TabsTrigger value="active">Active Passes</TabsTrigger>
          </TabsList>

          <TabsContent value="scanner">
            <QRScanner />
          </TabsContent>

          <TabsContent value="active">
            <ActivePassesList gatePasses={activePasses} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
