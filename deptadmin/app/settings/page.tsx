"use client"

import * as React from "react"
import {
  UserIcon, BellIcon, ShieldIcon, BuildingIcon,
  PaletteIcon, SaveIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const sections = [
  { id: "account", label: "Account", icon: UserIcon },
  { id: "notifications", label: "Notifications", icon: BellIcon },
  { id: "department", label: "Department", icon: BuildingIcon },
  { id: "appearance", label: "Appearance", icon: PaletteIcon },
  { id: "security", label: "Security", icon: ShieldIcon },
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = React.useState("account")
  const [saved, setSaved] = React.useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500 w-full min-h-full pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2 text-base max-w-xl">Manage your account preferences and department configuration.</p>
        </div>
        <Button
          onClick={handleSave}
          size="lg"
          className="rounded-full px-6 shadow-md shadow-primary/20 hover:shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 bg-primary text-primary-foreground font-semibold shrink-0"
        >
          <SaveIcon className="mr-2 size-4" />
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Nav */}
        <aside className="lg:w-56 shrink-0">
          <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap w-full text-left ${
                  activeSection === id
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 flex flex-col gap-5">

          {/* Account */}
          {activeSection === "account" && (
            <>
              <Card className="shadow-sm border-border/60">
                <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-background shadow-sm border border-border/50"><UserIcon className="size-3.5 text-foreground" /></span>
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5 space-y-4">
                  <div className="flex items-center gap-4 pb-4 border-b border-border/40">
                    <div className="size-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold shadow-md shrink-0">
                      AD
                    </div>
                    <div>
                      <p className="font-bold text-foreground">Admin User</p>
                      <p className="text-sm text-muted-foreground">admin@archie.edu</p>
                      <Badge variant="secondary" className="mt-1 text-xs bg-primary/10 text-primary border-0">Department Admin</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">First Name</label>
                      <Input defaultValue="Admin" className="h-9 rounded-lg border-border/60 bg-background" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Last Name</label>
                      <Input defaultValue="User" className="h-9 rounded-lg border-border/60 bg-background" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email Address</label>
                      <Input defaultValue="admin@archie.edu" className="h-9 rounded-lg border-border/60 bg-background" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Phone Number</label>
                      <Input defaultValue="+1 (555) 000-0000" className="h-9 rounded-lg border-border/60 bg-background" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Notifications */}
          {activeSection === "notifications" && (
            <Card className="shadow-sm border-border/60">
              <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-background shadow-sm border border-border/50"><BellIcon className="size-3.5 text-foreground" /></span>
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5 space-y-3">
                {[
                  { label: "New assignment requests", desc: "When a faculty member receives an assignment request", on: true },
                  { label: "Faculty availability changes", desc: "When a professor updates their availability", on: true },
                  { label: "Course schedule conflicts", desc: "When a scheduling conflict is detected", on: true },
                  { label: "System announcements", desc: "General system updates and maintenance notices", on: false },
                  { label: "Weekly summary report", desc: "A weekly digest of department activity", on: false },
                ].map(({ label, desc, on }) => (
                  <div key={label} className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-muted/10">
                    <div>
                      <p className="font-semibold text-sm text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                    <button
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none ${on ? "bg-primary" : "bg-muted-foreground/30"}`}
                    >
                      <span className={`pointer-events-none inline-block size-4 rounded-full bg-white shadow-lg ring-0 transition-transform ${on ? "translate-x-4" : "translate-x-0"}`} />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Department */}
          {activeSection === "department" && (
            <Card className="shadow-sm border-border/60">
              <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-background shadow-sm border border-border/50"><BuildingIcon className="size-3.5 text-foreground" /></span>
                  Department Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Department Name</label>
                    <Input defaultValue="Faculty of Applied Science and Technology" className="h-9 rounded-lg border-border/60 bg-background" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Department Code</label>
                    <Input defaultValue="FAST" className="h-9 rounded-lg border-border/60 bg-background" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Max Weekly Hours (Full-Time)</label>
                    <Input defaultValue="18" type="number" className="h-9 rounded-lg border-border/60 bg-background" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Max Weekly Hours (Part-Time)</label>
                    <Input defaultValue="9" type="number" className="h-9 rounded-lg border-border/60 bg-background" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appearance */}
          {activeSection === "appearance" && (
            <Card className="shadow-sm border-border/60">
              <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-background shadow-sm border border-border/50"><PaletteIcon className="size-3.5 text-foreground" /></span>
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5 space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Theme</p>
                  <div className="flex gap-3">
                    {["Light", "Dark", "System"].map(theme => (
                      <button
                        key={theme}
                        className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                          theme === "Light"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
                        }`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security */}
          {activeSection === "security" && (
            <Card className="shadow-sm border-border/60">
              <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-background shadow-sm border border-border/50"><ShieldIcon className="size-3.5 text-foreground" /></span>
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Current Password</label>
                  <Input type="password" placeholder="••••••••" className="h-9 rounded-lg border-border/60 bg-background" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">New Password</label>
                  <Input type="password" placeholder="••••••••" className="h-9 rounded-lg border-border/60 bg-background" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Confirm New Password</label>
                  <Input type="password" placeholder="••••••••" className="h-9 rounded-lg border-border/60 bg-background" />
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  )
}
