"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  SearchIcon, PlusIcon, GraduationCapIcon, ArrowLeftIcon,
  BookOpenIcon, ClockIcon, UsersIcon,
  BriefcaseIcon, CalendarIcon, FolderOpenIcon,
  FilterIcon, ChevronRightIcon, UserPlusIcon,
  Building2Icon, WrenchIcon, CheckCircle2Icon, AlertTriangleIcon, MapPinIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList,
} from "@/components/ui/combobox"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { getCampuses, getRooms } from "@/lib/facilities-api"
import { getDepartments } from "@/lib/course-api"
import { getFacultySchema, getFacultyAvailability } from "@/lib/faculty-schema-api"
import type { Campus, Room, RoomStatus } from "@/lib/facilities-types"

// Shared localStorage key — faculty page reads/writes the same store
export const ASSIGNMENT_STORAGE_KEY = "archie_assignments"

export type AssignmentRecord = {
  assignmentId: string
  id: string
  name: string
  course: string
  time: string
  load: string
  status: "Pending" | "Assigned" | "Rejected"
}

const HOURS_PER_COURSE = 3

type FacultyRosterEntry = {
  id: string
  name: string
  role: string
  employmentType: "Full-Time" | "Part-Time"
  seniority: number
  maxHoursPerWeek: number
  availability: { day: string; times: string }[]
  taughtSubjects: string[]
}

function statusBadgeClasses(status: RoomStatus) {
  switch (status) {
    case "AVAILABLE":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-0"
    case "OCCUPIED":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-0"
    case "MAINTENANCE":
      return "bg-red-500/10 text-red-700 dark:text-red-400 border-0"
    default:
      return "bg-muted text-foreground border-0"
  }
}

export function Dashboard() {
  const router = useRouter()

  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isAssignFacultyOpen, setIsAssignFacultyOpen] = React.useState(false)
  const [selectedFaculty, setSelectedFaculty] = React.useState("")
  const [selectedSubject, setSelectedSubject] = React.useState("")
  const [viewState, setViewState] = React.useState<"dashboard" | "details">("dashboard")
  const [year, setYear] = React.useState<string>("2025")
  const [term, setTerm] = React.useState<string>("Winter")
  const [activeDepartment, setActiveDepartment] = React.useState<string>("Faculty of Applied Science and Technology")
  const [searchQuery, setSearchQuery] = React.useState("")

  // ── Assignments — no default fake data ────────────────────────────────────
  // ── Assignments ────────────────────────────────────────────────────────────
  const [assignedFaculty, setAssignedFaculty] = React.useState<AssignmentRecord[]>([])
  // Guard: don't let the write effect fire on the initial mount render
  const hasMountedRef = React.useRef(false)

  // READ on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(ASSIGNMENT_STORAGE_KEY)
      if (stored) setAssignedFaculty(JSON.parse(stored) as AssignmentRecord[])
    } catch (err) {
      console.error("Failed to load assignments from localStorage:", err)
    }
  }, [])

  // WRITE only after mount — never on first render with empty array
  React.useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return  // skip the very first run, data isn't loaded yet
    }
    localStorage.setItem(ASSIGNMENT_STORAGE_KEY, JSON.stringify(assignedFaculty))
  }, [assignedFaculty])
  // ── Facilities ─────────────────────────────────────────────────────────────
  const [facilityStats, setFacilityStats] = React.useState({
    total: 0, available: 0, occupied: 0, maintenance: 0,
  })
  const [campuses, setCampuses] = React.useState<Campus[]>([])
  const [facilityRooms, setFacilityRooms] = React.useState<Room[]>([])
  const [facilityLoading, setFacilityLoading] = React.useState(true)
  const [facilityError, setFacilityError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function loadFacilitiesOverview() {
      try {
        setFacilityLoading(true)
        setFacilityError(null)
        const [
          allRooms, availableRooms, occupiedRooms,
          maintenanceRooms, campusesRes, recentRooms,
        ] = await Promise.all([
          getRooms({ limit: 1 }),
          getRooms({ status: "AVAILABLE", limit: 1 }),
          getRooms({ status: "OCCUPIED", limit: 1 }),
          getRooms({ status: "MAINTENANCE", limit: 1 }),
          getCampuses(),
          getRooms({ limit: 6 }),
        ])
        setFacilityStats({
          total: allRooms.total,
          available: availableRooms.total,
          occupied: occupiedRooms.total,
          maintenance: maintenanceRooms.total,
        })
        setCampuses(campusesRes.data)
        setFacilityRooms(recentRooms.data)
      } catch (err) {
        setFacilityError(err instanceof Error ? err.message : "Failed to load facilities data")
      } finally {
        setFacilityLoading(false)
      }
    }
    loadFacilitiesOverview()
  }, [])

  // ── Departments ────────────────────────────────────────────────────────────
  const [departments, setDepartments] = React.useState<string[]>([])

  React.useEffect(() => {
    let mounted = true
    async function loadDepartments() {
      try {
        const res = await getDepartments()
        if (!mounted) return
        const names = Array.isArray(res?.data) ? res.data.map((d: any) => d.name) : []
        setDepartments(names)
      } catch (err) {
        console.error("Failed to load departments:", err)
      }
    }
    loadDepartments()
    return () => { mounted = false }
  }, [])

  // ── Faculty — real DB data only, no fake roster ────────────────────────────
  const [dbFaculty, setDbFaculty] = React.useState<FacultyRosterEntry[]>([])

  React.useEffect(() => {
    let mounted = true
    async function loadDbFaculty() {
      try {
        const res = await getFacultySchema()
        const rows: any[] = res?.data ?? []
        const mapped: FacultyRosterEntry[] = rows.map(r => ({
          id: String(r.id ?? r.userId ?? r.employeeId ?? `db-${Math.random().toString(36).slice(2)}`),
          name: r.user_name ?? r.user_email ?? `User ${r.userId ?? r.id}`,
          role: r.designation ?? "Faculty",
          employmentType: "Full-Time",
          seniority: 0,
          maxHoursPerWeek: 18,
          availability: [],
          taughtSubjects: [],
        }))
        if (mounted) setDbFaculty(mapped)
      } catch (err) {
        console.error("Failed to load DB faculty:", err)
      }
    }
    loadDbFaculty()
    return () => { mounted = false }
  }, [])

  // mergedFaculty is just dbFaculty — no fake roster mixed in
  const mergedFaculty = dbFaculty

  // ── Lazy-load availability when a faculty is selected ─────────────────────
  React.useEffect(() => {
    if (!selectedFaculty) return
    const entry = mergedFaculty.find((f) => f.name === selectedFaculty)
    if (!entry) return
    if (entry.availability && entry.availability.length > 0) return

    let mounted = true
      ; (async () => {
        try {
          const res = await getFacultyAvailability(entry.id)
          const rows: any[] = res?.data ?? []
          const mapped = rows.map((r: any) => {
            const day = r.dayOfWeek ?? r.day ?? "Unknown"
            const times = r.startTime && r.endTime
              ? `${r.startTime} - ${r.endTime}`
              : r.times ?? ""
            return { day, times }
          })
          if (!mounted) return
          setDbFaculty((prev) =>
            prev.map((f) => (f.id === entry.id ? { ...f, availability: mapped } : f))
          )
        } catch (err) {
          console.error("Failed to load faculty availability:", err)
        }
      })()

    return () => { mounted = false }
  }, [selectedFaculty, mergedFaculty])

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleOpenDialog = () => {
    setYear("2025")
    setTerm("Winter")
    setIsDialogOpen(true)
  }

  const handleGoToDetails = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsDialogOpen(false)
    setViewState("details")
  }

  const handleAddFacultySubmit = () => {
    const roster = mergedFaculty.find((f) => f.name === selectedFaculty)
    setAssignedFaculty((prev) => [...prev, {
      assignmentId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      id: roster?.id ?? "",
      name: selectedFaculty,
      course: selectedSubject,
      time: "",
      load: roster?.employmentType ?? "Full-Time",
      status: "Pending",
    }])
    setIsAssignFacultyOpen(false)
    setSelectedFaculty("")
    setSelectedSubject("")
  }

  const eligibleFaculty = selectedSubject
    ? mergedFaculty.filter((f) => f.taughtSubjects.length === 0 || f.taughtSubjects.includes(selectedSubject))
    : mergedFaculty

  const filteredAssignedFaculty = assignedFaculty.filter((teacher) => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return true
    return (
      teacher.name.toLowerCase().includes(q) ||
      teacher.course.toLowerCase().includes(q) ||
      teacher.time.toLowerCase().includes(q) ||
      teacher.load.toLowerCase().includes(q) ||
      teacher.status.toLowerCase().includes(q)
    )
  })

  const pendingAssignments = assignedFaculty.filter((a) => a.status === "Pending").length
  const assignedCount = assignedFaculty.filter((a) => a.status === "Assigned").length

  // ── Render ─────────────────────────────────────────────────────────────────
  const renderContent = () => {
    if (viewState === "details") {
      return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-6 gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setViewState("dashboard")} className="rounded-full hover:bg-muted">
                <ArrowLeftIcon className="size-5" />
              </Button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Faculty Assignments</h1>
                <p className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-sm sm:text-base">
                  <Badge variant="outline" className="font-normal bg-background">{activeDepartment}</Badge>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="font-medium text-foreground">{term} {year}</span>
                </p>
              </div>
            </div>
            <Button
              onClick={() => setIsAssignFacultyOpen(true)}
              size="lg"
              className="rounded-full px-6 shadow-md shadow-primary/20 hover:shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 bg-primary text-primary-foreground font-semibold"
            >
              <UserPlusIcon className="mr-2 size-5" />
              Add Faculty
            </Button>
          </div>

          <div className="flex items-center gap-3 bg-card p-2 rounded-xl border border-border/60 shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50">
            <div className="relative flex-1 flex items-center">
              <SearchIcon className="absolute left-3 text-muted-foreground size-5" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by faculty name, course, status, or load..."
                className="pl-10 bg-transparent h-10 border-none shadow-none focus-visible:ring-0 text-base"
              />
            </div>
            <div className="w-px h-6 bg-border hidden sm:block" />
            <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border bg-muted/50 px-2 font-mono text-[10px] font-medium text-muted-foreground mr-1">
              <span className="text-xs">⌘</span>F
            </kbd>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredAssignedFaculty.map((teacher, i) => (
              <Card key={i} className="hover:border-primary/50 transition-all hover:shadow-md group overflow-hidden border-border/60">
                <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary p-2.5 rounded-full ring-2 ring-primary/5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <UsersIcon className="size-4" />
                      </div>
                      <CardTitle
                        className={`text-base font-semibold transition-colors ${teacher.id ? "cursor-pointer hover:text-primary underline-offset-2 hover:underline" : ""
                          }`}
                        onClick={() => {
                          if (teacher.id) router.push(`/faculty?id=${teacher.id}`)
                        }}
                      >
                        {teacher.name}
                      </CardTitle>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={teacher.load === "Full-Time" ? "default" : "secondary"} className="font-medium shadow-none">
                        {teacher.load}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 h-4 font-semibold border-0 ${teacher.status === "Assigned"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : teacher.status === "Rejected"
                            ? "bg-red-500/10 text-red-700 dark:text-red-400"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                          }`}
                      >
                        {teacher.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <div className="bg-muted p-1.5 rounded-md text-foreground/70"><BookOpenIcon className="size-3.5" /></div>
                      <span className="text-foreground font-medium">{teacher.course}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <div className="bg-muted p-1.5 rounded-md text-foreground/70"><ClockIcon className="size-3.5" /></div>
                      <span>{teacher.time || "—"}</span>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-3 mt-4 border-t border-border/40">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full font-medium hover:bg-muted/50 rounded-lg"
                      onClick={() => router.push(`/faculty?id=${teacher.id}`)}
                    >
                      View Profile
                    </Button>
                    <Button size="sm" className="w-full font-medium shadow-sm hover:shadow rounded-lg">
                      Reassign
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAssignedFaculty.length === 0 && (
            <Card className="border-dashed border-border/60">
              <CardContent className="py-12 text-center text-muted-foreground">
                {searchQuery ? "No assignments matched your search." : "No faculty assigned yet. Use the button above to assign faculty."}
              </CardContent>
            </Card>
          )}
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500 w-full min-h-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">Department Overview</h1>
            <p className="text-muted-foreground mt-2 text-base max-w-xl">
              Manage faculty assignments, track schedules, and oversee department allocations across all terms.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button variant="outline" className="hidden sm:flex gap-2 bg-background border-dashed text-foreground/80 hover:text-foreground">
              <FilterIcon className="size-4" />
              Filter
            </Button>
            <Button
              onClick={handleOpenDialog}
              size="lg"
              className="rounded-full px-6 shadow-md shadow-primary/20 hover:shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 bg-primary text-primary-foreground font-semibold"
            >
              <PlusIcon className="mr-2 size-5" />
              Term Setup
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <Card className="bg-card shadow-sm border-border/60 hover:border-border transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Term</CardTitle>
              <div className="p-2 bg-blue-500/10 rounded-lg"><CalendarIcon className="size-4 text-blue-500" /></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{term} {year}</div>
              <p className="text-xs text-muted-foreground mt-1 font-medium text-emerald-500">Current academic session</p>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-sm border-border/60 hover:border-border transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Faculty</CardTitle>
              <div className="p-2 bg-purple-500/10 rounded-lg"><UsersIcon className="size-4 text-purple-500" /></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{mergedFaculty.length}</div>
              <p className="text-xs mt-1 font-medium text-emerald-500">{pendingAssignments} pending approvals</p>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-sm border-border/60 hover:border-border transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Departments</CardTitle>
              <div className="p-2 bg-amber-500/10 rounded-lg"><FolderOpenIcon className="size-4 text-amber-500" /></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{departments.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all faculties</p>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-sm border-border/60 hover:border-border transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Assignments</CardTitle>
              <div className="p-2 bg-emerald-500/10 rounded-lg"><BriefcaseIcon className="size-4 text-emerald-500" /></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{assignedCount}</div>
              <p className="text-xs mt-1 font-medium text-emerald-500">{assignedFaculty.length} total records</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 flex flex-col gap-6">
            <Card className="border border-border/60 shadow-sm overflow-hidden rounded-xl">
              <CardHeader className="border-b border-border/40 bg-muted/20 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">Current Assignment Queue</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Quick snapshot of the faculty allocation workflow.
                  </p>
                </div>
                <Button variant="outline" className="rounded-xl" onClick={() => setViewState("details")}>
                  View All
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {assignedFaculty.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground text-sm">
                    No assignments yet. Use &quot;Assign Faculty&quot; to get started.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border/60">
                        <TableHead className="font-semibold text-foreground/80 pl-6 h-12">Faculty</TableHead>
                        <TableHead className="font-semibold text-foreground/80">Course</TableHead>
                        <TableHead className="font-semibold text-foreground/80">Status</TableHead>
                        <TableHead className="text-right font-semibold text-foreground/80 pr-6">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignedFaculty.slice(0, 5).map((faculty, i) => (
                        <TableRow key={i} className="h-16 group hover:bg-muted/30 transition-colors cursor-pointer">
                          <TableCell className="pl-6">
                            <div className="flex items-center gap-3">
                              <div className="size-9 rounded-full bg-gradient-to-tr from-primary/80 to-primary/40 flex items-center justify-center text-primary-foreground font-bold shrink-0 shadow-sm">
                                {faculty.name.split(" ").map((n) => n[0]).join("")}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-[15px]">{faculty.name}</span>
                                <span className="text-xs text-muted-foreground font-medium">{faculty.load}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{faculty.course}</TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={`px-2.5 py-0.5 text-xs font-medium border-0 ${faculty.status === "Assigned"
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                : faculty.status === "Rejected"
                                  ? "bg-red-500/10 text-red-700 dark:text-red-400"
                                  : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                                }`}
                            >
                              {faculty.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 font-medium bg-background text-foreground shadow-sm border border-border/50 rounded-lg"
                              onClick={() => {
                                if (faculty.id) {
                                  router.push(`/faculty?id=${faculty.id}`)
                                }
                              }}
                            >
                              Open <ChevronRightIcon className="size-3 text-muted-foreground" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card className="border border-border/60 shadow-sm overflow-hidden rounded-xl">
              <CardHeader className="border-b border-border/40 bg-muted/20">
                <CardTitle className="text-lg font-bold">Facilities Overview</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Live room counts from the facilities-management public API.
                </p>
              </CardHeader>
              <CardContent className="pt-5">
                {facilityLoading ? (
                  <div className="text-sm text-muted-foreground">Loading facilities data...</div>
                ) : facilityError ? (
                  <div className="text-sm text-red-600 dark:text-red-400">{facilityError}</div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="rounded-xl border border-border/50 bg-muted/10 p-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total Rooms</p>
                        <p className="text-2xl font-bold mt-1">{facilityStats.total}</p>
                      </div>
                      <div className="rounded-xl border border-border/50 bg-emerald-500/5 p-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Available</p>
                        <p className="text-2xl font-bold mt-1 text-emerald-600">{facilityStats.available}</p>
                      </div>
                      <div className="rounded-xl border border-border/50 bg-amber-500/5 p-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Occupied</p>
                        <p className="text-2xl font-bold mt-1 text-amber-600">{facilityStats.occupied}</p>
                      </div>
                      <div className="rounded-xl border border-border/50 bg-red-500/5 p-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Maintenance</p>
                        <p className="text-2xl font-bold mt-1 text-red-600">{facilityStats.maintenance}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-3">Campuses</h3>
                        <div className="space-y-3">
                          {campuses.map((campus) => (
                            <div key={campus.id} className="rounded-xl border border-border/50 bg-background p-4">
                              <div className="flex items-center gap-2">
                                <MapPinIcon className="size-4 text-primary" />
                                <p className="font-semibold text-foreground">{campus.name}</p>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{campus.address}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-3">Recent Rooms</h3>
                        <div className="space-y-3">
                          {facilityRooms.map((room) => (
                            <div key={room.id} className="rounded-xl border border-border/50 bg-background p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-semibold text-foreground">{room.roomNumber}</p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {room.building.name} • {room.building.campus?.name ?? "Unknown campus"}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {room.roomType} • Capacity {room.capacity}
                                  </p>
                                </div>
                                <Badge variant="secondary" className={statusBadgeClasses(room.currentStatus)}>
                                  {room.currentStatus}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={() => router.push("/scheduling")} className="rounded-xl">
                        Open Facilities <ChevronRightIcon className="ml-2 size-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-6">
            <Card className="bg-card shadow-sm border-border/60">
              <CardHeader className="border-b border-border/40 bg-muted/20">
                <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-5 space-y-3">
                <Button className="w-full justify-start rounded-xl" onClick={() => setIsAssignFacultyOpen(true)}>
                  <UserPlusIcon className="mr-2 size-4" />
                  Assign Faculty
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl" onClick={() => router.push("/faculty")}>
                  <UsersIcon className="mr-2 size-4" />
                  Open Faculty Directory
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl" onClick={() => router.push("/courses")}>
                  <BookOpenIcon className="mr-2 size-4" />
                  Open Course Catalog
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl" onClick={() => router.push("/scheduling")}>
                  <Building2Icon className="mr-2 size-4" />
                  Open Facilities
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-sm border-border/60">
              <CardHeader className="border-b border-border/40 bg-muted/20">
                <CardTitle className="text-lg font-bold">Alerts</CardTitle>
              </CardHeader>
              <CardContent className="pt-5 space-y-3">
                <div className="rounded-xl border border-amber-200 bg-amber-50/40 dark:bg-amber-950/20 dark:border-amber-900/40 p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangleIcon className="size-4 mt-0.5 text-amber-600" />
                    <div>
                      <p className="font-semibold text-sm">Pending approvals</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {pendingAssignments} assignment request(s) are waiting for faculty response.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/20 dark:border-emerald-900/40 p-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle2Icon className="size-4 mt-0.5 text-emerald-600" />
                    <div>
                      <p className="font-semibold text-sm">Assigned successfully</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {assignedCount} course assignment(s) are fully confirmed.
                      </p>
                    </div>
                  </div>
                </div>

                {!facilityLoading && (
                  <div className="rounded-xl border border-red-200 bg-red-50/40 dark:bg-red-950/20 dark:border-red-900/40 p-4">
                    <div className="flex items-start gap-2">
                      <WrenchIcon className="size-4 mt-0.5 text-red-600" />
                      <div>
                        <p className="font-semibold text-sm">Facilities maintenance</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {facilityStats.maintenance} room(s) are currently unavailable due to maintenance.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {renderContent()}

      {/* Term Setup Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden border-border/80 shadow-lg rounded-2xl">
          <div className="p-6 bg-muted/10 border-b border-border/60">
            <DialogHeader className="mb-0">
              <DialogTitle className="text-2xl flex items-center gap-3 font-bold">
                <div className="bg-primary/10 p-2.5 rounded-xl text-primary shadow-sm">
                  <GraduationCapIcon className="size-5" />
                </div>
                Select Term
              </DialogTitle>
              <DialogDescription className="pt-2 text-sm text-muted-foreground/80">
                Choose an academic year, term, and department to continue to faculty assignment planning.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6">
            <form onSubmit={handleGoToDetails} className="space-y-5">
              <FieldGroup className="space-y-5">
                <Field className="space-y-2.5">
                  <FieldLabel htmlFor="department" className="font-semibold text-foreground/80">Department</FieldLabel>
                  <Select value={activeDepartment} onValueChange={(val) => setActiveDepartment(val ?? "")}>
                    <SelectTrigger id="department" className="h-11 bg-muted/30 border-border/60 rounded-xl">
                      <SelectValue placeholder="Select department..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/80 shadow-md">
                      <SelectGroup className="p-1">
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept} className="rounded-lg mb-0.5 cursor-pointer focus:bg-primary/10 focus:text-primary">
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                <Field className="space-y-2.5">
                  <FieldLabel htmlFor="year" className="font-semibold text-foreground/80">Academic Year</FieldLabel>
                  <Select value={year} onValueChange={(val) => setYear(val ?? "")}>
                    <SelectTrigger id="year" className="h-11 bg-muted/30 border-border/60 rounded-xl">
                      <SelectValue placeholder="Select year..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/80 shadow-md">
                      <SelectGroup className="p-1">
                        {["2024", "2025", "2026", "2027"].map((y) => (
                          <SelectItem key={y} value={y} className="rounded-lg mb-0.5 cursor-pointer focus:bg-primary/10 focus:text-primary">
                            {y}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                <Field className="space-y-2.5">
                  <FieldLabel htmlFor="term" className="font-semibold text-foreground/80">Term</FieldLabel>
                  <Select value={term} onValueChange={(val) => setTerm(val ?? "")}>
                    <SelectTrigger id="term" className="h-11 bg-muted/30 border-border/60 rounded-xl">
                      <SelectValue placeholder="Select term..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/80 shadow-md">
                      <SelectGroup className="p-1">
                        {["Winter", "Summer", "Fall"].map((t) => (
                          <SelectItem key={t} value={t} className="rounded-lg mb-0.5 cursor-pointer focus:bg-primary/10 focus:text-primary">
                            {t}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>

              <DialogFooter className="mt-8 gap-2 sm:gap-0 pt-4 border-t border-border/40">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl font-medium hover:bg-muted">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl font-semibold shadow-sm px-6">
                  Select Term <ChevronRightIcon className="ml-2 size-4" />
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Faculty Dialog */}
      <Dialog
        open={isAssignFacultyOpen}
        onOpenChange={(open) => {
          setIsAssignFacultyOpen(open)
          if (!open) {
            setSelectedFaculty("")
            setSelectedSubject("")
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-border/80 shadow-lg rounded-2xl flex flex-col max-h-[90vh]">
          <div className="p-6 bg-muted/10 border-b border-border/60 shrink-0">
            <DialogHeader className="mb-0">
              <DialogTitle className="text-2xl flex items-center gap-3 font-bold">
                <div className="bg-primary/10 p-2.5 rounded-xl text-primary shadow-sm">
                  <UserPlusIcon className="size-5" />
                </div>
                Assign Faculty to Subject
              </DialogTitle>
              <DialogDescription className="pt-2 text-sm text-muted-foreground/80">
                Faculty ranked by seniority — higher seniority gets first preference. Part-time faculty have a reduced weekly cap.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="overflow-y-auto flex-1 p-6 space-y-6">
            <Field className="space-y-2.5">
              <FieldLabel htmlFor="subject" className="font-semibold text-foreground/80">Subject</FieldLabel>
              <Select value={selectedSubject} onValueChange={(val) => setSelectedSubject(val ?? "")}>
                <SelectTrigger id="subject" className="h-11 bg-muted/30 border-border/60 rounded-xl">
                  <SelectValue placeholder="Choose a subject to assign..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/80 shadow-md">
                  <SelectGroup className="p-1">
                    {["Advanced Algorithms", "Computer Networks", "Database Management", "Operating Systems", "Cloud Computing", "Software Engineering", "Web Development"].map((s) => (
                      <SelectItem key={s} value={s} className="rounded-lg mb-0.5 cursor-pointer focus:bg-primary/10 focus:text-primary">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FieldLabel className="font-semibold text-foreground/80">Faculty Priority Queue</FieldLabel>
                <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">sorted by seniority</span>
              </div>

              <div className="space-y-2 mt-1">
                {mergedFaculty.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 py-8 text-center text-sm text-muted-foreground">
                    Loading faculty from database...
                  </div>
                ) : eligibleFaculty.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 py-8 text-center text-sm text-muted-foreground">
                    No faculty have previously taught <span className="font-medium text-foreground">{selectedSubject}</span>.
                  </div>
                ) : eligibleFaculty.map((f, index) => {
                  const coursesAssigned = assignedFaculty.filter((a) => a.name === f.name).length
                  const usedHours = coursesAssigned * HOURS_PER_COURSE
                  const remainingHours = f.maxHoursPerWeek - usedHours
                  const capacityPct = Math.min((usedHours / f.maxHoursPerWeek) * 100, 100)
                  const noAvailability = f.availability.length === 0
                  const atCapacity = remainingHours <= 0
                  const isDisabled = atCapacity
                  const isSelected = selectedFaculty === f.name

                  return (
                    <div
                      key={f.id}
                      onClick={() => !isDisabled && setSelectedFaculty(isSelected ? "" : f.name)}
                      className={[
                        "relative rounded-xl border p-4 transition-all",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                          : isDisabled
                            ? "border-border/30 bg-muted/20 opacity-50 cursor-not-allowed"
                            : "border-border/60 hover:border-primary/40 hover:bg-muted/20 cursor-pointer",
                      ].join(" ")}
                    >
                      <div className="flex items-start gap-3">
                        <div className={[
                          "shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5",
                          index === 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : index === 1 ? "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                              : "bg-muted text-muted-foreground",
                        ].join(" ")}>
                          {index + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm">{f.name}</span>
                            <Badge
                              variant={f.employmentType === "Full-Time" ? "default" : "secondary"}
                              className="text-[10px] px-1.5 py-0 h-4 font-medium shadow-none"
                            >
                              {f.employmentType}
                            </Badge>
                            {atCapacity && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-medium text-red-600 border-red-300">
                                At Capacity
                              </Badge>
                            )}
                          </div>

                          <div className="text-xs text-muted-foreground mt-0.5">
                            {f.role} · <span className="font-medium">{f.seniority} yrs</span> seniority
                          </div>

                          <div className="flex flex-wrap gap-1 mt-2">
                            {noAvailability ? (
                              <span className="text-[10px] text-muted-foreground italic">Availability not loaded yet</span>
                            ) : (
                              f.availability.map((a) => (
                                <span key={a.day} className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-medium">
                                  {a.day.slice(0, 3)}
                                </span>
                              ))
                            )}
                          </div>

                          <div className="mt-3">
                            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                              <span>{usedHours}h used / {f.maxHoursPerWeek}h max/week</span>
                              <span className={remainingHours <= 0 ? "text-red-500 font-semibold" : remainingHours <= 3 ? "text-amber-500 font-semibold" : "text-emerald-600 font-semibold"}>
                                {remainingHours > 0 ? `${remainingHours}h remaining` : "Full"}
                              </span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={[
                                  "h-full rounded-full transition-all",
                                  capacityPct >= 100 ? "bg-red-500" : capacityPct >= 70 ? "bg-amber-500" : "bg-emerald-500",
                                ].join(" ")}
                                style={{ width: `${capacityPct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-border/60 p-6 shrink-0">
            <Button type="button" variant="ghost" onClick={() => setIsAssignFacultyOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddFacultySubmit}
              disabled={!selectedFaculty || !selectedSubject}
              className="rounded-xl px-6"
            >
              Assign Faculty
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}