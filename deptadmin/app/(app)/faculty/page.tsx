"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import {
  UsersIcon, SearchIcon, FilterIcon, PlusIcon,
  MoreHorizontalIcon, MailIcon, PhoneIcon, CheckCircle2Icon,
  ArrowLeftIcon, BookOpenIcon, ClockIcon, MapPinIcon,
  BriefcaseIcon, ChevronRightIcon, CalendarIcon, HistoryIcon,
  UserPlusIcon, InboxIcon, CheckIcon, XIcon, PaperclipIcon, ImageIcon, SendIcon,
  Loader2Icon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  getFacultySchema,
  getFacultyAvailability,
  getDepartmentsSchema,
} from "@/lib/faculty-schema-api"

// ─── Types ────────────────────────────────────────────────────────────────────

type Faculty = {
  id: string
  name: string
  role: string
  department: string
  status: string
  email: string
  phone: string
  office: string
  preferredSubjects: string[]
  availability: { day: string; times: string }[]
  assignments: { course: string; time: string; term: string }[]
  pastCourses: { course: string; term: string; students: number }[]
}

// ─── Main Inner Component ─────────────────────────────────────────────────────

function FacultyPageInner() {
  const searchParams = useSearchParams()

  const [viewState, setViewState] = React.useState<"directory" | "details">("directory")
  const [selectedFaculty, setSelectedFaculty] = React.useState<Faculty | null>(null)

  // Real data only — no dummy array
  const [facultyData, setFacultyData] = React.useState<Faculty[]>([])
  const [loading, setLoading] = React.useState(true)
  const [availabilityLoading, setAvailabilityLoading] = React.useState(false)

  // Search query state — wired to the search input
  const [searchQuery, setSearchQuery] = React.useState("")

  // Department UUID → name map
  const [deptMap, setDeptMap] = React.useState<Record<string, string>>({})

  // ── Load faculty + departments in parallel on mount ────────────────────────
  React.useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const [facultyRes, deptRes] = await Promise.all([
          getFacultySchema(),
          getDepartmentsSchema(),
        ])

        // Build UUID → department name lookup
        const map: Record<string, string> = {}
        const deptRows: any[] = deptRes?.data ?? []
        for (const d of deptRows) {
          if (d.id && d.name) map[String(d.id)] = d.name
        }

        const rows: any[] = facultyRes?.data ?? []
        const mapped: Faculty[] = rows.map((r) => ({
          id: String(r.id),
          name: r.user_name ?? `User ${r.userId ?? r.id}`,
          role: r.designation ?? "Faculty",
          // Resolve UUID to readable name; fall back to raw value if unknown
          department: map[String(r.departmentId)] ?? r.departmentId ?? "—",
          status: r.status ?? "Active",
          email: r.user_email ?? "—",
          phone: r.phone ?? "—",
          office: r.office ?? "—",
          preferredSubjects: r.preferredSubjects ?? [],
          availability: [], // loaded lazily when profile opens
          assignments: [],
          pastCourses: [],
        }))

        if (mounted) {
          setDeptMap(map)
          setFacultyData(mapped)
        }
      } catch (err) {
        console.error("Failed to load faculty:", err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  // ── Filtered list for the table ────────────────────────────────────────────
  const displayFaculty = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return facultyData
    return facultyData.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q) ||
        f.department.toLowerCase().includes(q) ||
        f.role.toLowerCase().includes(q)
    )
  }, [facultyData, searchQuery])

  // ── Auto-open profile when navigated from dashboard ───────────────────────
  React.useEffect(() => {
    const id = searchParams.get("id")
    if (id && facultyData.length > 0) {
      const found = facultyData.find((f) => f.id === id)
      if (found) openDetails(found)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, facultyData])

  // ── Open profile + lazily load real availability ──────────────────────────
  const openDetails = async (faculty: Faculty) => {
    setSelectedFaculty(faculty)
    setViewState("details")

    if (faculty.availability.length === 0) {
      setAvailabilityLoading(true)
      try {
        const res = await getFacultyAvailability(faculty.id)
        const slots: any[] = res?.data ?? []
        const mapped = slots.map((s: any) => ({
          day: s.dayOfWeek ?? s.day ?? "—",
          times:
            s.startTime && s.endTime
              ? `${s.startTime} - ${s.endTime}`
              : s.times ?? "—",
        }))
        // Update both the list and the selected record
        setFacultyData((prev) =>
          prev.map((f) => (f.id === faculty.id ? { ...f, availability: mapped } : f))
        )
        setSelectedFaculty((prev) =>
          prev ? { ...prev, availability: mapped } : prev
        )
      } catch (err) {
        console.error("Failed to load availability for", faculty.id, err)
      } finally {
        setAvailabilityLoading(false)
      }
    }
  }

  // ── Assignment requests (DB-backed) ──────────────────────────────────────
  const [allAssignments, setAllAssignments] = React.useState<AssignmentRecord[]>([])

  React.useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/assignments")
        const json = await res.json()
        const rows: any[] = json.data ?? []
        setAllAssignments(rows.map((r) => ({
          assignmentId: r.assignmentId,
          id: r.facultyId,
          name: r.facultyName ?? "—",
          course: r.course ?? "—",
          time: r.day && r.startTime && r.endTime
            ? `${r.day} ${r.startTime}–${r.endTime}`
            : "—",
          load: "Full-Time",
          status: r.status === "ACCEPTED" ? "Assigned"
            : r.status === "REJECTED" ? "Rejected"
              : "Pending",
        })))
      } catch (err) {
        console.error("Failed to load assignments:", err)
      }
    }
    load()
  }, [])

  const updateAssignmentStatus = async (assignmentId: string, status: "Assigned" | "Rejected") => {
    // Optimistic UI update first — feels instant
    setAllAssignments((prev) =>
      prev.map((a) => a.assignmentId === assignmentId ? { ...a, status } : a)
    )
    try {
      await fetch(`/api/assignments/${assignmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: status === "Assigned" ? "ACCEPTED" : "REJECTED",
        }),
      })
    } catch (err) {
      console.error("Failed to update assignment status:", err)
      // Rollback if API call failed
      setAllAssignments((prev) =>
        prev.map((a) =>
          a.assignmentId === assignmentId
            ? { ...a, status: status === "Assigned" ? "Pending" : "Pending" }
            : a
        )
      )
    }
  }
  // ── Message dialog ─────────────────────────────────────────────────────────
  const [isMessageOpen, setIsMessageOpen] = React.useState(false)
  const [messageText, setMessageText] = React.useState("")
  const [attachments, setAttachments] = React.useState<{ name: string; url: string; type: string }[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const [messages, setMessages] = React.useState<{
    id: number; sender: string; isAdmin: boolean; text: string; time: string
    attachments?: { name: string; url: string; type: string }[]
  }[]>([])

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const previews = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
    }))
    setAttachments((prev) => [...prev, ...previews])
    e.target.value = ""
  }

  const handleSendMessage = () => {
    if (!messageText.trim() && attachments.length === 0) return
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        sender: "Admin User",
        isAdmin: true,
        text: messageText.trim(),
        attachments: attachments.length > 0 ? attachments : undefined,
        time: new Date().toLocaleString("en-US", {
          month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
        }),
      },
    ])
    setMessageText("")
    setAttachments([])
  }

  // ── Add Faculty dialog ─────────────────────────────────────────────────────
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [form, setForm] = React.useState({
    name: "", email: "", phone: "", office: "",
    role: "", department: "", status: "Active",
  })

  const handleFormChange = (field: string, value: string | null) => {
    setForm((prev) => ({ ...prev, [field]: value ?? "" }))
  }

  const isFormValid = form.name && form.email && form.role && form.department

  const handleAddFaculty = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: wire to POST /api/faculty_schema/faculty — for now adds locally
    // temp- prefix makes it clear this isn't in the DB yet
    const newFaculty: Faculty = {
      id: `temp-${Date.now()}`,
      name: form.name,
      role: form.role,
      department: form.department,
      status: form.status,
      email: form.email,
      phone: form.phone || "—",
      office: form.office || "—",
      preferredSubjects: [],
      availability: [],
      assignments: [],
      pastCourses: [],
    }
    setFacultyData((prev) => [...prev, newFaculty])
    setIsAddDialogOpen(false)
    setForm({ name: "", email: "", phone: "", office: "", role: "", department: "", status: "Active" })
  }

  // ─── DETAIL VIEW ────────────────────────────────────────────────────────────

  if (viewState === "details" && selectedFaculty) {
    return (
      <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full min-h-full pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border/60 pb-6 gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewState("directory")}
              className="rounded-full hover:bg-muted shadow-sm border border-border/40"
            >
              <ArrowLeftIcon className="size-5" />
            </Button>
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-full bg-gradient-to-tr from-primary/80 to-primary/40 flex items-center justify-center text-primary-foreground text-xl font-bold shrink-0 shadow-md">
                {selectedFaculty.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {selectedFaculty.name}
                </h1>
                <p className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-sm sm:text-base font-medium">
                  <span className="text-foreground/80">{selectedFaculty.role}</span>
                  <span className="text-muted-foreground/30">•</span>
                  <span>{selectedFaculty.department}</span>
                  <span className="text-muted-foreground/30">•</span>
                  <Badge
                    variant="secondary"
                    className={`px-2 py-0 text-xs border-0 ${selectedFaculty.status === "Active"
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                      }`}
                  >
                    {selectedFaculty.status}
                  </Badge>
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl font-medium">
              <MoreHorizontalIcon className="size-4" />
            </Button>
            <Button
              className="rounded-xl font-medium px-6 shadow-md"
              onClick={() => setIsMessageOpen(true)}
            >
              <MailIcon className="mr-2 size-4" /> Message
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-2">
          {/* Left Column */}
          <div className="flex flex-col gap-6 xl:col-span-1">
            {/* Contact */}
            <Card className="shadow-sm border-border/60 bg-card">
              <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-background shadow-sm border border-border/50">
                    <PhoneIcon className="size-3.5 text-foreground" />
                  </span>
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Email Address</p>
                  <p className="text-[15px] font-medium text-foreground">{selectedFaculty.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Phone Number</p>
                  <p className="text-[15px] font-medium text-foreground">{selectedFaculty.phone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Office Location</p>
                  <p className="text-[15px] font-medium text-foreground flex items-center gap-1.5">
                    <MapPinIcon className="size-3.5 text-muted-foreground" />
                    {selectedFaculty.office}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Availability — shows real data fetched from API */}
            <Card className="shadow-sm border-border/60 bg-card">
              <CardHeader className="pb-3 border-b border-border/40 bg-muted/20 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-background shadow-sm border border-border/50">
                    <ClockIcon className="size-3.5 text-foreground" />
                  </span>
                  Teaching Availability
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {availabilityLoading ? (
                  <div className="py-8 flex justify-center items-center gap-2 text-muted-foreground">
                    <Loader2Icon className="size-4 animate-spin" />
                    <span className="text-sm">Loading availability...</span>
                  </div>
                ) : selectedFaculty.availability.length > 0 ? (
                  <div className="space-y-3">
                    {selectedFaculty.availability.map((avail, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-muted/10"
                      >
                        <span className="font-bold text-[15px] text-foreground/90">{avail.day}</span>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium bg-background px-3 py-1 rounded-md shadow-sm border border-border/40">
                          <ClockIcon className="size-3.5" />
                          {avail.times}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center bg-muted/10 rounded-xl border border-dashed border-border/60">
                    <p className="text-muted-foreground text-sm font-medium">
                      No availability on record for this faculty member.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preferred Subjects */}
            <Card className="shadow-sm border-border/60 bg-card">
              <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-background shadow-sm border border-border/50">
                    <BookOpenIcon className="size-3.5 text-foreground" />
                  </span>
                  Preferred Subjects
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 flex flex-wrap gap-2">
                {selectedFaculty.preferredSubjects.length > 0 ? (
                  selectedFaculty.preferredSubjects.map((sub) => (
                    <Badge
                      key={sub}
                      variant="secondary"
                      className="bg-primary/5 text-primary hover:bg-primary/10 border-primary/10 py-1 px-3 text-sm font-medium"
                    >
                      {sub}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm font-medium">No preferred subjects listed.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6 xl:col-span-2">
            {/* Pending Assignment Requests */}
            {(() => {
              const pending = allAssignments.filter(
                (a) => a.id === selectedFaculty.id && a.status === "Pending"
              )
              if (pending.length === 0) return null
              return (
                <Card className="shadow-sm border-amber-300/60 bg-amber-50/30 dark:bg-amber-900/10 dark:border-amber-700/40">
                  <CardHeader className="pb-3 border-b border-amber-200/60 dark:border-amber-700/30 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                      <InboxIcon className="size-5 text-amber-500" />
                      Pending Requests
                    </CardTitle>
                    <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-0 font-semibold">
                      {pending.length} awaiting response
                    </Badge>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    {pending.map((req) => (
                      <div
                        key={req.assignmentId}
                        className="flex items-center justify-between gap-4 p-4 rounded-xl border border-amber-200/60 dark:border-amber-700/30 bg-background"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate">{req.course}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <ClockIcon className="size-3 shrink-0" />
                            {req.time}
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateAssignmentStatus(req.assignmentId, "Rejected")}
                            className="rounded-lg border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 font-medium gap-1.5"
                          >
                            <XIcon className="size-3.5" /> Decline
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => updateAssignmentStatus(req.assignmentId, "Assigned")}
                            className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-1.5 shadow-sm"
                          >
                            <CheckIcon className="size-3.5" /> Accept
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )
            })()}

            {/* Current Assignments */}
            <Card className="shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border-border/60 bg-card">
              <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <BriefcaseIcon className="size-5 text-primary" />
                  Current Enrollments & Assignments
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {selectedFaculty.assignments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-border/40 bg-muted/20 hover:bg-muted/20">
                        <TableHead className="font-semibold h-11 text-muted-foreground/80 pl-6">Course Name</TableHead>
                        <TableHead className="font-semibold text-muted-foreground/80">Schedule</TableHead>
                        <TableHead className="font-semibold text-muted-foreground/80 text-right pr-6">Term</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedFaculty.assignments.map((assignment, idx) => (
                        <TableRow
                          key={idx}
                          className="hover:bg-muted/30 transition-colors border-b border-border/30 last:border-0 h-14 cursor-pointer group"
                        >
                          <TableCell className="font-bold text-[15px] pl-6 text-foreground/90 w-[45%]">
                            {assignment.course}
                          </TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground group-hover:text-foreground/80 transition-colors">
                              <CalendarIcon className="size-3.5" />
                              {assignment.time}
                            </span>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Badge variant="secondary" className="bg-muted text-foreground/70 border border-border/40 shadow-sm font-medium">
                              {assignment.term}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                    <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3 border border-border/60">
                      <BookOpenIcon className="size-5" />
                    </div>
                    <p className="text-foreground/80 font-semibold">No assigned courses right now</p>
                    <p className="text-muted-foreground text-sm max-w-sm mt-1 mb-4">
                      This professor doesn&apos;t have any classes scheduled for the upcoming terms.
                    </p>
                    <Button variant="outline" className="shadow-sm">Assign Course Schedule</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Teaching History */}
            <Card className="shadow-sm border-border/60 bg-card overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/40 bg-muted/10 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <HistoryIcon className="size-5 text-indigo-500" />
                  Teaching History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {selectedFaculty.pastCourses.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-border/40 bg-muted/20 hover:bg-muted/20">
                        <TableHead className="font-semibold h-11 text-muted-foreground/80 pl-6">Course Taught</TableHead>
                        <TableHead className="font-semibold text-muted-foreground/80">Term Record</TableHead>
                        <TableHead className="font-semibold text-muted-foreground/80 text-right pr-6">Students</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedFaculty.pastCourses.map((past, idx) => (
                        <TableRow
                          key={idx}
                          className="hover:bg-muted/30 transition-colors border-b border-border/30 last:border-0 h-14"
                        >
                          <TableCell className="font-medium text-[15px] pl-6 text-foreground/80 w-[45%]">
                            {past.course}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs bg-background shadow-sm border-border/60 text-muted-foreground font-semibold">
                              {past.term}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <span className="font-bold text-[15px] mr-1">{past.students}</span>
                            <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Qty</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-10 flex flex-col items-center justify-center text-center px-4">
                    <p className="text-muted-foreground text-sm font-medium">
                      No historical teaching records found for this faculty member.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Message Dialog */}
        <Dialog
          open={isMessageOpen}
          onOpenChange={(open) => { setIsMessageOpen(open); if (!open) setMessageText("") }}
        >
          <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden rounded-2xl shadow-xl [&>button]:top-4 [&>button]:right-4 h-[600px] flex flex-col">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-border/50 bg-muted/30 pr-14 shrink-0">
              <div className="size-9 rounded-full bg-gradient-to-tr from-primary/80 to-primary/40 flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0">
                {selectedFaculty.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground leading-tight">
                  Admin User &amp; {selectedFaculty.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0">
                  {selectedFaculty.email}
                </DialogDescription>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-[#F8FAFC] dark:bg-zinc-950">
              {messages.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-center">
                  <MailIcon className="size-8 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground text-sm font-medium">
                    No messages yet. Start the conversation.
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-3">
                    <div
                      className={`size-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${msg.isAdmin
                        ? "bg-gradient-to-tr from-indigo-500 to-purple-500 text-white"
                        : "bg-gradient-to-tr from-primary/80 to-primary/40 text-primary-foreground"
                        }`}
                    >
                      {msg.sender.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-sm font-semibold text-foreground">{msg.sender}</span>
                        <span className="text-xs text-muted-foreground">{msg.time}</span>
                      </div>
                      {msg.text && (
                        <div className="bg-background rounded-xl rounded-tl-sm border border-border/50 px-4 py-3 text-sm text-foreground shadow-sm">
                          {msg.text}
                        </div>
                      )}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {msg.attachments.map((att, i) =>
                            att.type.startsWith("image/") ? (
                              <img
                                key={i}
                                src={att.url}
                                alt={att.name}
                                className="max-h-40 max-w-xs rounded-xl border border-border/50 shadow-sm object-cover"
                              />
                            ) : (
                              <div
                                key={i}
                                className="flex items-center gap-2 bg-background border border-border/50 rounded-xl px-3 py-2 text-sm shadow-sm"
                              >
                                <PaperclipIcon className="size-4 text-muted-foreground shrink-0" />
                                <span className="font-medium text-foreground truncate max-w-[180px]">{att.name}</span>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="shrink-0 border-t border-border/50 bg-background px-4 pt-3 pb-4">
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {attachments.map((att, i) => (
                    <div key={i} className="relative group">
                      {att.type.startsWith("image/") ? (
                        <img src={att.url} alt={att.name} className="h-16 w-16 rounded-lg object-cover border border-border/50" />
                      ) : (
                        <div className="flex items-center gap-2 bg-muted/50 border border-border/50 rounded-lg px-3 py-2 text-xs font-medium text-foreground">
                          <PaperclipIcon className="size-3.5 text-muted-foreground" />
                          <span className="max-w-32 truncate">{att.name}</span>
                        </div>
                      )}
                      <button
                        onClick={() => setAttachments((prev) => prev.filter((_, j) => j !== i))}
                        className="absolute -top-1.5 -right-1.5 size-4 rounded-full bg-foreground text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XIcon className="size-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="rounded-xl border border-border/60 bg-muted/30 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-colors">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage() }
                  }}
                  placeholder={`Message ${selectedFaculty.name}...`}
                  rows={2}
                  className="w-full resize-none bg-transparent px-4 pt-3 pb-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <div className="flex items-center justify-between px-3 pb-2">
                  <div className="flex items-center gap-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <button
                      type="button"
                      title="Attach file"
                      onClick={() => { if (fileInputRef.current) { fileInputRef.current.accept = "*/*"; fileInputRef.current.click() } }}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <PaperclipIcon className="size-4" />
                    </button>
                    <button
                      type="button"
                      title="Attach image"
                      onClick={() => { if (fileInputRef.current) { fileInputRef.current.accept = "image/*"; fileInputRef.current.click() } }}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <ImageIcon className="size-4" />
                    </button>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    disabled={!messageText.trim() && attachments.length === 0}
                    onClick={handleSendMessage}
                    className="rounded-lg h-8 px-4 font-semibold shadow-sm gap-1.5"
                  >
                    <SendIcon className="size-3.5" /> Send
                  </Button>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5 px-1">Enter to send · Shift+Enter for new line</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // ─── DIRECTORY VIEW ─────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500 w-full min-h-full">
      {/* Add Faculty Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-2xl shadow-xl [&>button]:top-4 [&>button]:right-4">
          <div className="flex items-start gap-3 px-6 py-5 border-b border-border/50 bg-muted/30 pr-12">
            <div className="p-2 bg-primary/10 rounded-xl shrink-0 mt-0.5">
              <UserPlusIcon className="size-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">Add New Faculty</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Fill in the details to register a new staff member.
              </DialogDescription>
            </div>
          </div>

          <form onSubmit={handleAddFaculty}>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Full Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Jane Smith"
                    value={form.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    className="h-9 rounded-lg border-border/60 bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Email Address <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="jane@archie.edu"
                    value={form.email}
                    onChange={(e) => handleFormChange("email", e.target.value)}
                    className="h-9 rounded-lg border-border/60 bg-background"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Phone Number</label>
                  <Input
                    placeholder="+1 (555) 000-0000"
                    value={form.phone}
                    onChange={(e) => handleFormChange("phone", e.target.value)}
                    className="h-9 rounded-lg border-border/60 bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Office Location</label>
                  <Input
                    placeholder="e.g. L-205"
                    value={form.office}
                    onChange={(e) => handleFormChange("office", e.target.value)}
                    className="h-9 rounded-lg border-border/60 bg-background"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Role <span className="text-destructive">*</span>
                  </label>
                  <Select value={form.role} onValueChange={(v) => handleFormChange("role", v)}>
                    <SelectTrigger className="h-9 w-full rounded-lg border-border/60 bg-background">
                      <SelectValue placeholder="Select role..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="Professor">Professor</SelectItem>
                        <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                        <SelectItem value="Lecturer">Lecturer</SelectItem>
                        <SelectItem value="Adjunct Faculty">Adjunct Faculty</SelectItem>
                        <SelectItem value="Visiting Professor">Visiting Professor</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Department <span className="text-destructive">*</span>
                  </label>
                  <Select value={form.department} onValueChange={(v) => handleFormChange("department", v)}>
                    <SelectTrigger className="h-9 w-full rounded-lg border-border/60 bg-background">
                      <SelectValue placeholder="Select dept..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {/* Populate from real deptMap if available, else static fallback */}
                        {Object.keys(deptMap).length > 0
                          ? Object.entries(deptMap).map(([, name]) => (
                            <SelectItem key={name} value={name}>{name}</SelectItem>
                          ))
                          : (
                            <>
                              <SelectItem value="Applied Science">Applied Science</SelectItem>
                              <SelectItem value="Business">Business</SelectItem>
                              <SelectItem value="Health Sciences">Health Sciences</SelectItem>
                              <SelectItem value="Media & Creative Arts">Media & Creative Arts</SelectItem>
                              <SelectItem value="Social & Community Services">Social & Community Services</SelectItem>
                            </>
                          )
                        }
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Employment Status</label>
                <Select value={form.status} onValueChange={(v) => handleFormChange("status", v)}>
                  <SelectTrigger className="h-9 w-full rounded-lg border-border/60 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="On Leave">On Leave</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="px-6 py-4 border-t border-border/50 bg-muted/20 rounded-b-2xl">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid}
                className="rounded-xl px-6 shadow-md shadow-primary/20 font-semibold"
              >
                <UserPlusIcon className="mr-2 size-4" />
                Add Faculty
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">Faculty Directory</h1>
          <p className="text-muted-foreground mt-2 text-base max-w-xl">
            Manage all teaching staff, update roles, and track faculty status and contact details.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="outline" className="hidden sm:flex gap-2 bg-background border-dashed text-foreground/80 hover:text-foreground">
            <FilterIcon className="size-4" />
            Filter Staff
          </Button>
          <Button
            size="lg"
            onClick={() => setIsAddDialogOpen(true)}
            className="rounded-full px-6 shadow-md shadow-primary/20 hover:shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 bg-primary text-primary-foreground font-semibold"
          >
            <PlusIcon className="mr-2 size-5" />
            Add Faculty
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="bg-card shadow-sm border-border/60 hover:border-border transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Staff</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <UsersIcon className="size-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? "—" : facultyData.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium text-emerald-500">Live from database</p>
          </CardContent>
        </Card>
        <Card className="bg-card shadow-sm border-border/60 hover:border-border transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <CheckCircle2Icon className="size-4 text-indigo-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? "—" : facultyData.filter((f) => f.status === "Active").length}
            </div>
            <p className="text-xs mt-1 font-medium text-emerald-500">Currently active</p>
          </CardContent>
        </Card>
      </div>

      {/* Search + Table */}
      <div className="flex flex-col gap-5 mt-2">
        <div className="flex items-center gap-3 bg-card p-2 rounded-xl border border-border/60 shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50">
          <div className="relative flex-1 flex items-center">
            <SearchIcon className="absolute left-3 text-muted-foreground size-5" />
            <Input
              placeholder="Search by name, email, role, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-transparent h-10 border-none shadow-none focus-visible:ring-0 text-base"
            />
          </div>
          <div className="w-px h-6 bg-border hidden sm:block" />
          <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border bg-muted/50 px-2 font-mono text-[10px] font-medium text-muted-foreground mr-1">
            <span className="text-xs">⌘</span>F
          </kbd>
        </div>

        <Card className="border border-border/60 shadow-sm overflow-hidden rounded-xl">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2Icon className="size-6 animate-spin" />
              <p className="text-sm font-medium">Loading faculty from database...</p>
            </div>
          ) : displayFaculty.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <UsersIcon className="size-8 mb-1" />
              <p className="text-sm font-semibold text-foreground">
                {searchQuery ? "No results match your search" : "No faculty records found"}
              </p>
              <p className="text-xs">
                {searchQuery ? "Try a different name, email, or department" : "Add a faculty member to get started"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border/60">
                  <TableHead className="w-[250px] font-semibold text-foreground/80 pl-6 h-12">Staff Member</TableHead>
                  <TableHead className="font-semibold text-foreground/80">Role & Department</TableHead>
                  <TableHead className="font-semibold text-foreground/80">Status</TableHead>
                  <TableHead className="text-right font-semibold text-foreground/80 pr-6">Contact & Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayFaculty.map((faculty) => (
                  <TableRow
                    key={faculty.id}
                    onClick={() => openDetails(faculty)}
                    className="h-16 group hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-gradient-to-tr from-primary/80 to-primary/40 flex items-center justify-center text-primary-foreground font-bold shrink-0 shadow-sm">
                          {faculty.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-[15px] group-hover:text-primary transition-colors">{faculty.name}</span>
                          <span className="text-xs text-muted-foreground font-medium">{faculty.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-sm text-foreground/90">{faculty.role}</span>
                        <span className="text-xs text-muted-foreground">{faculty.department}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`px-2.5 py-0.5 text-xs font-medium border-0 ${faculty.status === "Active"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                          }`}
                      >
                        {faculty.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          onClick={(e) => { e.stopPropagation() }}
                        >
                          <MailIcon className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity gap-1 font-medium bg-background text-foreground shadow-sm border border-border/50 rounded-lg ml-2"
                        >
                          View Profile <ChevronRightIcon className="size-3 text-muted-foreground" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  )
}

// ─── Export ────────────────────────────────────────────────────────────────────

export default function FacultyPage() {
  return (
    <React.Suspense fallback={null}>
      <FacultyPageInner />
    </React.Suspense>
  )
}