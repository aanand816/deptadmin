"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  SearchIcon, PlusIcon, GraduationCapIcon, ArrowLeftIcon,
  BookOpenIcon, ClockIcon, UsersIcon,
  BriefcaseIcon, CalendarIcon, FolderOpenIcon,
  FilterIcon, ChevronRightIcon, UserPlusIcon,
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

// Shared localStorage key — faculty page reads/writes the same store
export const ASSIGNMENT_STORAGE_KEY = "archie_assignments"

export type AssignmentRecord = {
  assignmentId: string
  id: string        // faculty id
  name: string
  course: string
  time: string
  load: string
  status: "Pending" | "Assigned" | "Rejected"
}

const defaultAssignments: AssignmentRecord[] = [
  { assignmentId: "a1", id: "f1", name: "Kyra Smith",    course: "Software Engineering",  time: "Mon/Wed 10:00 AM", load: "Full-Time", status: "Assigned" },
  { assignmentId: "a2", id: "f2", name: "John Doe",      course: "Data Structures",       time: "Tue/Thu 2:00 PM",  load: "Part-Time", status: "Assigned" },
  { assignmentId: "a3", id: "f3", name: "Alice Johnson", course: "Web Development",       time: "Fri 9:00 AM",      load: "Full-Time", status: "Assigned" },
  { assignmentId: "a4", id: "f4", name: "Bob Martin",    course: "Database Management",   time: "Mon/Wed 1:00 PM",  load: "Part-Time", status: "Assigned" },
  { assignmentId: "a5", id: "f5", name: "Eve Davis",     course: "Network Security",      time: "Tue/Thu 10:00 AM", load: "Full-Time", status: "Assigned" },
]

// Hours per course per week (standard)
const HOURS_PER_COURSE = 3

type FacultyRosterEntry = {
  id: string
  name: string
  role: string
  employmentType: "Full-Time" | "Part-Time"
  seniority: number // years — higher means higher assignment priority
  maxHoursPerWeek: number
  availability: { day: string; times: string }[]
  taughtSubjects: string[] // subjects previously taught — used for subject-based filtering
}

// Static faculty pool with capacity, availability, and subject history.
// Sorted descending by seniority so priority order is preserved after filtering.
const facultyRoster: FacultyRosterEntry[] = [
  {
    id: "f1", name: "Kyra Smith", role: "Professor",
    employmentType: "Full-Time", seniority: 15, maxHoursPerWeek: 18,
    taughtSubjects: ["Software Engineering", "Web Development", "Cloud Computing", "Computer Networks"],
    availability: [
      { day: "Monday",    times: "9:00 AM - 2:00 PM" },
      { day: "Wednesday", times: "9:00 AM - 2:00 PM" },
      { day: "Friday",    times: "11:00 AM - 4:00 PM" },
    ],
  },
  {
    id: "f5", name: "Eve Davis", role: "Professor",
    employmentType: "Full-Time", seniority: 12, maxHoursPerWeek: 18,
    taughtSubjects: ["Digital Media Production", "Graphic Design", "UI/UX Design"],
    availability: [
      { day: "Tuesday",  times: "9:00 AM - 1:00 PM" },
      { day: "Thursday", times: "9:00 AM - 1:00 PM" },
      { day: "Friday",   times: "9:00 AM - 1:00 PM" },
    ],
  },
  {
    id: "f2", name: "John Doe", role: "Associate Professor",
    employmentType: "Full-Time", seniority: 10, maxHoursPerWeek: 18,
    taughtSubjects: ["Advanced Algorithms", "Database Management", "Operating Systems", "Computer Networks"],
    availability: [], // currently on leave — no availability
  },
  {
    id: "f3", name: "Alice Johnson", role: "Lecturer",
    employmentType: "Part-Time", seniority: 5, maxHoursPerWeek: 9,
    taughtSubjects: ["Intro to Business", "Marketing 101", "Business Ethics"],
    availability: [
      { day: "Tuesday",  times: "10:00 AM - 5:00 PM" },
      { day: "Thursday", times: "10:00 AM - 5:00 PM" },
    ],
  },
  {
    id: "f4", name: "Bob Martin", role: "Adjunct Faculty",
    employmentType: "Part-Time", seniority: 3, maxHoursPerWeek: 9,
    taughtSubjects: ["Anatomy", "Clinical Practice", "Healthcare Ethics"],
    availability: [
      { day: "Monday",    times: "1:00 PM - 6:00 PM" },
      { day: "Wednesday", times: "1:00 PM - 6:00 PM" },
    ],
  },
]

// Parse "9:00 AM" → 24h integer (9), "1:00 PM" → 13, etc.
function parseHour(timeStr: string): number {
  const [time, period] = timeStr.trim().split(" ")
  const h = parseInt(time.split(":")[0], 10)
  if (period === "PM" && h !== 12) return h + 12
  if (period === "AM" && h === 12) return 0
  return h
}

// Generate individual hourly slots from a faculty member's availability windows.
// e.g. { day: "Monday", times: "9:00 AM - 2:00 PM" } → ["Mon 9:00 AM", "Mon 10:00 AM", ...]
function generateTimeSlots(availability: { day: string; times: string }[]): string[] {
  const abbr: Record<string, string> = {
    Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed",
    Thursday: "Thu", Friday: "Fri", Saturday: "Sat", Sunday: "Sun",
  }
  const slots: string[] = []
  for (const avail of availability) {
    const [startStr, endStr] = avail.times.split(" - ")
    const start = parseHour(startStr)
    const end = parseHour(endStr)
    const day = abbr[avail.day] ?? avail.day.slice(0, 3)
    for (let h = start; h < end; h++) {
      const period = h >= 12 ? "PM" : "AM"
      const display = h > 12 ? h - 12 : h === 0 ? 12 : h
      slots.push(`${day} ${display}:00 ${period}`)
    }
  }
  return slots
}

export function Dashboard() {
  const router = useRouter()

  // Original term selector modal state
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  
  // Smart faculty assignment modal state
  const [isAssignFacultyOpen, setIsAssignFacultyOpen] = React.useState(false)
  const [selectedFaculty, setSelectedFaculty] = React.useState("")
  const [selectedSubject, setSelectedSubject] = React.useState("")
  const [selectedTimeSlot, setSelectedTimeSlot] = React.useState("")

  // Reset time slot whenever the faculty selection changes
  React.useEffect(() => { setSelectedTimeSlot("") }, [selectedFaculty])

  const [viewState, setViewState] = React.useState<"dashboard" | "details">("dashboard")
  
  const [year, setYear] = React.useState<string>("2025")
  const [term, setTerm] = React.useState<string>("Winter")

  const [activeDepartment, setActiveDepartment] = React.useState<string>("Faculty of Applied Science and Technology")

  const [assignedFaculty, setAssignedFaculty] = React.useState<AssignmentRecord[]>(() => {
    if (typeof window === "undefined") return defaultAssignments
    try {
      const stored = localStorage.getItem(ASSIGNMENT_STORAGE_KEY)
      return stored ? (JSON.parse(stored) as AssignmentRecord[]) : defaultAssignments
    } catch {
      return defaultAssignments
    }
  })

  // Persist assignments to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem(ASSIGNMENT_STORAGE_KEY, JSON.stringify(assignedFaculty))
  }, [assignedFaculty])

  // Re-sync when the faculty page updates status in another tab
  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === ASSIGNMENT_STORAGE_KEY && e.newValue) {
        try { setAssignedFaculty(JSON.parse(e.newValue)) } catch { /* ignore */ }
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const departments = [
    "Faculty of Applied Science and Technology",
    "Faculty of Business",
    "Faculty of Health Sciences",
    "Faculty of Media and Creative Arts",
    "Faculty of Social and Community Services"
  ]

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
    const roster = facultyRoster.find(f => f.name === selectedFaculty)
    setAssignedFaculty(prev => [...prev, {
      assignmentId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      id: roster?.id ?? "",
      name: selectedFaculty,
      course: selectedSubject,
      time: selectedTimeSlot,
      load: roster?.employmentType ?? "Full-Time",
      status: "Pending" as const,
    }])
    setIsAssignFacultyOpen(false)
    setSelectedFaculty("")
    setSelectedSubject("")
    setSelectedTimeSlot("")
  }

  // Derived values for the smart assignment dialog
  const eligibleFaculty = selectedSubject
    ? facultyRoster.filter(f => f.taughtSubjects.includes(selectedSubject))
    : facultyRoster

  const selectedFacultyEntry = facultyRoster.find(f => f.name === selectedFaculty)
  const availableTimeSlots = selectedFacultyEntry
    ? generateTimeSlots(selectedFacultyEntry.availability)
    : []

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
            
            <Button onClick={() => setIsAssignFacultyOpen(true)} size="lg" className="rounded-full px-6 shadow-md shadow-primary/20 hover:shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 bg-primary text-primary-foreground font-semibold">
              <UserPlusIcon className="mr-2 size-5" />
              Add Faculty
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {assignedFaculty.map((teacher, i) => (
              <Card key={i} className="hover:border-primary/50 transition-all hover:shadow-md group overflow-hidden border-border/60">
                <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary p-2.5 rounded-full ring-2 ring-primary/5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <UsersIcon className="size-4" />
                      </div>
                      <CardTitle
                        className={`text-base font-semibold transition-colors ${
                          teacher.id
                            ? "cursor-pointer hover:text-primary underline-offset-2 hover:underline"
                            : ""
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
                        className={`text-[10px] px-1.5 py-0 h-4 font-semibold border-0 ${
                          teacher.status === "Assigned"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : teacher.status === "Rejected"
                            ? "bg-red-500/10 text-red-700 dark:text-red-400"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                        }`}
                      >
                        {teacher.status === "Assigned" ? "Assigned" : teacher.status === "Rejected" ? "Rejected" : "Pending"}
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
                      <span>{teacher.time}</span>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-3 mt-4 border-t border-border/40">
                    <Button variant="outline" size="sm" className="w-full font-medium hover:bg-muted/50 rounded-lg">Edit</Button>
                    <Button size="sm" className="w-full font-medium shadow-sm hover:shadow rounded-lg">Reassign</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500 w-full min-h-full">
        {/* Header/Title section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">Department Overview</h1>
            <p className="text-muted-foreground mt-2 text-base max-w-xl">Manage faculty assignments, track schedules, and oversee department allocations across all terms.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button variant="outline" className="hidden sm:flex gap-2 bg-background border-dashed text-foreground/80 hover:text-foreground">
              <FilterIcon className="size-4" />
              Filter
            </Button>
            <Button onClick={handleOpenDialog} size="lg" className="rounded-full px-6 shadow-md shadow-primary/20 hover:shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 bg-primary text-primary-foreground font-semibold">
              <PlusIcon className="mr-2 size-5" />
              Term Setup
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <Card className="bg-card shadow-sm border-border/60 hover:border-border transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Term</CardTitle>
              <div className="p-2 bg-blue-500/10 rounded-lg"><CalendarIcon className="size-4 text-blue-500" /></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">Winter 2025</div>
              <p className="text-xs text-muted-foreground mt-1 font-medium text-emerald-500">Current academic session</p>
            </CardContent>
          </Card>
          <Card className="bg-card shadow-sm border-border/60 hover:border-border transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Faculty</CardTitle>
              <div className="p-2 bg-purple-500/10 rounded-lg"><UsersIcon className="size-4 text-purple-500" /></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">124</div>
              <p className="text-xs mt-1 font-medium text-emerald-500">+4 from last term</p>
            </CardContent>
          </Card>
          <Card className="bg-card shadow-sm border-border/60 hover:border-border transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Departments</CardTitle>
              <div className="p-2 bg-amber-500/10 rounded-lg"><FolderOpenIcon className="size-4 text-amber-500" /></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">5</div>
              <p className="text-xs text-muted-foreground mt-1">Across all faculties</p>
            </CardContent>
          </Card>
          <Card className="bg-card shadow-sm border-border/60 hover:border-border transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Assignments</CardTitle>
              <div className="p-2 bg-emerald-500/10 rounded-lg"><BriefcaseIcon className="size-4 text-emerald-500" /></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">342</div>
              <p className="text-xs mt-1 font-medium text-emerald-500">98% completion rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Table */}
        <div className="flex flex-col gap-5 mt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Recent Records</h2>
          </div>
          
          <div className="flex items-center gap-3 bg-card p-2 rounded-xl border border-border/60 shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50">
            <div className="relative flex-1 flex items-center">
              <SearchIcon className="absolute left-3 text-muted-foreground size-5" />
              <Input placeholder="Quick search records, departments, or faculty..." className="pl-10 bg-transparent h-10 border-none shadow-none focus-visible:ring-0 text-base" />
            </div>
            <div className="w-px h-6 bg-border hidden sm:block" />
            <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border bg-muted/50 px-2 font-mono text-[10px] font-medium text-muted-foreground mr-1">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>

          <Card className="border border-border/60 shadow-sm overflow-hidden rounded-xl">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border/60">
                  <TableHead className="w-[100px] h-12 font-semibold text-foreground/80">Year</TableHead>
                  <TableHead className="w-[120px] font-semibold text-foreground/80">Term</TableHead>
                  <TableHead className="font-semibold text-foreground/80">Department</TableHead>
                  <TableHead className="text-right font-semibold text-foreground/80 pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="h-16 group hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => {
                  setActiveDepartment("Faculty of Applied Science and Technology")
                  setYear("2025")
                  setTerm("Winter")
                  setViewState("details")
                }}>
                  <TableCell className="font-semibold text-base">2025</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-medium bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-500/20 border-0">Winter</Badge>
                  </TableCell>
                  <TableCell className="text-[15px] font-medium text-foreground/80">Faculty of Applied Science and Technology</TableCell>
                  <TableCell className="text-right pr-4">
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity gap-1 font-medium bg-background text-foreground shadow-sm border border-border/50">
                      Manage <ChevronRightIcon className="size-3 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow className="h-16 group hover:bg-muted/20 transition-colors cursor-pointer">
                  <TableCell className="font-semibold text-base">2024</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 border-0">Fall</Badge>
                  </TableCell>
                  <TableCell className="text-[15px] font-medium text-foreground/80">Faculty of Business</TableCell>
                  <TableCell className="text-right pr-4">
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity gap-1 font-medium bg-background text-foreground shadow-sm border border-border/50">
                      Manage <ChevronRightIcon className="size-3 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow className="h-16 group hover:bg-muted/20 transition-colors cursor-pointer">
                  <TableCell className="font-semibold text-base">2024</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 border-0">Summer</Badge>
                  </TableCell>
                  <TableCell className="text-[15px] font-medium text-foreground/80">Faculty of Health Sciences</TableCell>
                  <TableCell className="text-right pr-4">
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity gap-1 font-medium bg-background text-foreground shadow-sm border border-border/50">
                      Manage <ChevronRightIcon className="size-3 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
             </Table>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <>
      {renderContent()}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-border/80 shadow-lg rounded-2xl">
          <div className="p-6 bg-muted/10 border-b border-border/60">
            <DialogHeader className="mb-0">
              <DialogTitle className="text-2xl flex items-center gap-3 font-bold">
                <div className="bg-primary/10 p-2.5 rounded-xl text-primary shadow-sm">
                  <GraduationCapIcon className="size-5" />
                </div>
                Term Setup
              </DialogTitle>
              <DialogDescription className="pt-3 text-[15px] font-medium text-muted-foreground/80">
                Department admins use this setup to select a target term. After setup, you can assign professors to subjects and view their available times.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6">
            <form onSubmit={handleGoToDetails} className="space-y-6">
              <FieldGroup className="space-y-5">
                <Field className="space-y-2.5">
                  <FieldLabel htmlFor="department" className="font-semibold text-foreground/80">Department Selection</FieldLabel>
                  <Combobox items={departments} onValueChange={(val: string | string[] | null) => {
                    if (val && typeof val === 'string') setActiveDepartment(val)
                    else if (Array.isArray(val) && val.length > 0) setActiveDepartment(val[0])
                  }}>
                    <ComboboxInput
                      id="department"
                      placeholder="Search to select a department..."
                      className="w-full h-11 bg-muted/30 border-border/60 rounded-xl"
                      required
                    />
                    <ComboboxContent className="rounded-xl border-border/80 shadow-md">
                      <ComboboxEmpty className="py-6 text-center text-sm text-muted-foreground">No department found matching criteria.</ComboboxEmpty>
                      <ComboboxList className="p-1.5">
                        {(item: string) => (
                          <ComboboxItem key={item} value={item} className="rounded-lg mb-1 py-2.5 px-3 data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary cursor-pointer transition-colors">
                            {item}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </Field>
                
                <div className="grid grid-cols-2 gap-5">
                  <Field className="space-y-2.5">
                    <FieldLabel htmlFor="year" className="font-semibold text-foreground/80">Academic Year</FieldLabel>
                    <Select value={year} onValueChange={(val) => setYear(val || "2025")}>
                      <SelectTrigger id="year" className="h-11 bg-muted/30 border-border/60 rounded-xl">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border/80 shadow-md">
                        <SelectGroup className="p-1">
                          {["2024", "2025", "2026", "2027"].map(y => (
                            <SelectItem key={y} value={y} className="rounded-lg mb-0.5 cursor-pointer focus:bg-primary/10 focus:text-primary">{y}</SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field className="space-y-2.5">
                    <FieldLabel htmlFor="term" className="font-semibold text-foreground/80">Term Segment</FieldLabel>
                    <Select value={term} onValueChange={(val) => setTerm(val || "Winter")}>
                      <SelectTrigger id="term" className="h-11 bg-muted/30 border-border/60 rounded-xl">
                        <SelectValue placeholder="Select term" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border/80 shadow-md">
                        <SelectGroup className="p-1">
                          {["Winter", "Spring", "Summer", "Fall"].map(t => (
                            <SelectItem key={t} value={t} className="rounded-lg mb-0.5 cursor-pointer focus:bg-primary/10 focus:text-primary">{t}</SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
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


      <Dialog open={isAssignFacultyOpen} onOpenChange={(open) => {
        setIsAssignFacultyOpen(open)
        if (!open) { setSelectedFaculty(""); setSelectedSubject(""); setSelectedTimeSlot("") }
      }}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-border/80 shadow-lg rounded-2xl flex flex-col max-h-[90vh]">
          {/* Header */}
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

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 p-6 space-y-6">

            {/* Subject picker */}
            <Field className="space-y-2.5">
              <FieldLabel htmlFor="subject" className="font-semibold text-foreground/80">Subject</FieldLabel>
              <Select value={selectedSubject} onValueChange={(val) => setSelectedSubject(val ?? "")}>
                <SelectTrigger id="subject" className="h-11 bg-muted/30 border-border/60 rounded-xl">
                  <SelectValue placeholder="Choose a subject to assign..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/80 shadow-md">
                  <SelectGroup className="p-1">
                    {["Advanced Algorithms", "Computer Networks", "Database Management", "Operating Systems", "Cloud Computing", "Software Engineering", "Web Development"].map(s => (
                      <SelectItem key={s} value={s} className="rounded-lg mb-0.5 cursor-pointer focus:bg-primary/10 focus:text-primary">{s}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            {/* Priority faculty list */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FieldLabel className="font-semibold text-foreground/80">Faculty Priority Queue</FieldLabel>
                <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">sorted by seniority</span>
              </div>

              <div className="space-y-2 mt-1">
                {eligibleFaculty.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 py-8 text-center text-sm text-muted-foreground">
                    No faculty have previously taught <span className="font-medium text-foreground">{selectedSubject}</span>.
                  </div>
                ) : eligibleFaculty.map((f, index) => {
                  const coursesAssigned = assignedFaculty.filter(a => a.name === f.name).length
                  const usedHours = coursesAssigned * HOURS_PER_COURSE
                  const remainingHours = f.maxHoursPerWeek - usedHours
                  const capacityPct = Math.min((usedHours / f.maxHoursPerWeek) * 100, 100)
                  const noAvailability = f.availability.length === 0
                  const atCapacity = remainingHours <= 0
                  const isDisabled = noAvailability || atCapacity
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
                        {/* Priority rank badge */}
                        <div className={[
                          "shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5",
                          index === 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                          index === 1 ? "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300" :
                          "bg-muted text-muted-foreground",
                        ].join(" ")}>
                          {index + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Name row */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm">{f.name}</span>
                            <Badge
                              variant={f.employmentType === "Full-Time" ? "default" : "secondary"}
                              className="text-[10px] px-1.5 py-0 h-4 font-medium shadow-none"
                            >
                              {f.employmentType}
                            </Badge>
                            {noAvailability && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-medium text-muted-foreground">
                                No Availability
                              </Badge>
                            )}
                            {atCapacity && !noAvailability && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-medium text-red-600 border-red-300">
                                At Capacity
                              </Badge>
                            )}
                          </div>

                          {/* Role + seniority */}
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {f.role} · <span className="font-medium">{f.seniority} yrs</span> seniority
                          </div>

                          {/* Available days */}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {f.availability.length > 0
                              ? f.availability.map(a => (
                                  <span key={a.day} className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-medium">
                                    {a.day.slice(0, 3)}
                                  </span>
                                ))
                              : <span className="text-[10px] text-muted-foreground italic">Not available this term</span>
                            }
                          </div>

                          {/* Capacity bar */}
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
                                  capacityPct >= 100 ? "bg-red-500" :
                                  capacityPct >= 70  ? "bg-amber-500" :
                                  "bg-emerald-500",
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

            {/* Time slot picker — shown only after a faculty is selected */}
            {selectedFaculty && (
              <div className="space-y-2.5">
                <FieldLabel className="font-semibold text-foreground/80">
                  Available Time Slots
                  <span className="ml-2 text-[11px] text-muted-foreground font-normal">for {selectedFaculty}</span>
                </FieldLabel>
                <div className="grid grid-cols-3 gap-2">
                  {availableTimeSlots.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTimeSlot(selectedTimeSlot === slot ? "" : slot)}
                      className={[
                        "text-xs py-2.5 px-2 rounded-xl border text-left transition-all flex items-center gap-1.5",
                        selectedTimeSlot === slot
                          ? "border-primary bg-primary/5 text-primary font-semibold shadow-sm"
                          : "border-border/60 hover:border-primary/40 hover:bg-muted/20 text-foreground/80",
                      ].join(" ")}
                    >
                      <ClockIcon className="size-3 shrink-0 opacity-60" />
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 pt-4 border-t border-border/40 shrink-0 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsAssignFacultyOpen(false)}
              className="rounded-xl font-medium hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!selectedFaculty || !selectedSubject || !selectedTimeSlot}
              onClick={handleAddFacultySubmit}
              className="rounded-xl font-semibold shadow-sm px-6"
            >
              Assign Faculty <ChevronRightIcon className="ml-2 size-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
