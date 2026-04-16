"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  GraduationCapIcon, LayoutDashboardIcon, UsersIcon, BookOpenIcon,
  CalendarIcon, SettingsIcon, BellIcon, MenuIcon, XIcon,
  SearchIcon, LogOutIcon
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface AppShellUser {
  id: number
  name: string
  email: string
  role: string
}

export function AppShell({ children, user }: { children: React.ReactNode; user?: AppShellUser }) {
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboardIcon },
    { name: 'Faculty Management', href: '/faculty', icon: UsersIcon },
    { name: 'Course Catalog', href: '/courses', icon: BookOpenIcon },
    { name: 'Facilities', href: '/scheduling', icon: CalendarIcon },
  ]

  const currentNav = navigation.find(n => n.href === pathname) || { name: 'Dashboard' }

  const initials = user?.name
    ? user.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "AD"

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-zinc-950 flex font-sans text-foreground selection:bg-primary/20">
      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-card border-r border-border/60 shadow-sm transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} flex flex-col`}>
        <div className="h-16 flex items-center px-6 border-b border-border/60 gap-3 bg-card shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-center p-2 bg-primary rounded-xl shrink-0 shadow-sm shadow-primary/20">
            <GraduationCapIcon className="size-5 text-primary-foreground" />
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Archie Admin</span>
          <Button variant="ghost" size="icon" className="ml-auto lg:hidden hover:bg-muted" onClick={() => setIsSidebarOpen(false)}>
            <XIcon className="size-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-thin scrollbar-thumb-border">
          <div className="space-y-1.5">
            <p className="px-3 text-[11px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-3">Main Menu</p>
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link key={item.name} href={item.href} onClick={() => setIsSidebarOpen(false)}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={`w-full justify-start gap-3 rounded-xl transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary hover:bg-primary/15 font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60 font-medium"
                    }`}
                  >
                    <Icon className="size-4.5" />
                    {item.name}
                  </Button>
                </Link>
              )
            })}
          </div>

          <div className="space-y-1.5">
            <p className="px-3 text-[11px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-3">System</p>
            <Link href="/settings" onClick={() => setIsSidebarOpen(false)}>
              <Button variant={pathname === "/settings" ? "secondary" : "ghost"} className={`w-full justify-start gap-3 rounded-xl transition-all ${pathname === "/settings" ? "bg-primary/10 text-primary hover:bg-primary/15 font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-muted/60 font-medium"}`}>
                <SettingsIcon className="size-4.5" />
                Settings
              </Button>
            </Link>
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-muted/60 font-medium rounded-xl group">
              <BellIcon className="size-4.5 group-hover:animate-wiggle" />
              Notifications
              <Badge className="ml-auto bg-primary text-primary-foreground rounded-full h-5 min-w-5 px-1 flex items-center justify-center font-bold text-[10px] shadow-sm">3</Badge>
            </Button>
          </div>
        </div>

        <div className="p-4 border-t border-border/60 bg-muted/10 space-y-2">
          <div className="flex items-center gap-3 w-full p-2.5 rounded-xl bg-background border border-border/60 shadow-sm">
            <div className="size-9 rounded-full bg-gradient-to-tr from-indigo-500 relative to-purple-500 flex items-center justify-center text-white font-bold shrink-0 shadow-inner">
              {initials}
              <span className="absolute bottom-0 right-0 size-2.5 bg-emerald-500 border-2 border-background rounded-full"></span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate text-foreground/90">{user?.name ?? "Admin User"}</p>
              <p className="text-xs text-muted-foreground truncate font-medium">{user?.email ?? "admin@archie.edu"}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 font-medium rounded-xl"
            onClick={handleLogout}
          >
            <LogOutIcon className="size-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col lg:pl-[280px] transition-all duration-300 ease-in-out min-w-0">

        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-xl border-b border-border/60 flex items-center justify-between px-4 sm:px-8 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden hover:bg-muted/60 -ml-2" onClick={() => setIsSidebarOpen(true)}>
              <MenuIcon className="size-5" />
            </Button>

            <div className="hidden sm:flex items-center text-sm font-medium text-muted-foreground gap-2">
              <span className="hover:text-foreground cursor-pointer transition-colors px-2 py-1 rounded-md hover:bg-muted/50">Admin</span>
              <span className="text-muted-foreground/40">/</span>
              <span className="text-foreground px-2 py-1 rounded-md bg-muted/30">{currentNav.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="icon" className="relative rounded-full text-muted-foreground hover:text-foreground hover:bg-muted">
              <SearchIcon className="size-5" />
            </Button>
            <Button variant="ghost" size="icon" className="relative rounded-full text-muted-foreground hover:text-foreground hover:bg-muted">
              <BellIcon className="size-5" />
              <span className="absolute top-2 right-2.5 size-2 bg-red-500 rounded-full border-2 border-background"></span>
            </Button>
            <div className="pl-4 border-l border-border/60 hidden sm:flex items-center gap-2 ml-1">
              <div className="size-8 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {initials}
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors font-medium"
                title="Sign out"
              >
                <LogOutIcon className="size-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 container max-w-7xl mx-auto overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
