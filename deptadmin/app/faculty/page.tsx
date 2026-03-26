"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import {
  UsersIcon, SearchIcon, FilterIcon, PlusIcon,
  MoreHorizontalIcon, MailIcon, PhoneIcon, CheckCircle2Icon,
  ArrowLeftIcon, BookOpenIcon, ClockIcon, MapPinIcon,
  BriefcaseIcon, ChevronRightIcon, CalendarIcon, HistoryIcon,
  UserPlusIcon
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

type Faculty = {
  id: string;
  name: string;
  role: string;
  department: string;
  status: string;
  email: string;
  phone: string;
  office: string;
  preferredSubjects: string[];
  availability: { day: string, times: string }[];
  assignments: { course: string, time: string, term: string }[];
  pastCourses: { course: string, term: string, students: number }[];
}

const initialFacultyData: Faculty[] = [
  {
    id: "f1", name: "Kyra Smith", role: "Professor", department: "Applied Science", status: "Active",
    email: "kyra.smith@archie.edu", phone: "+1 (555) 123-4567", office: "L-204",
    preferredSubjects: ["Software Engineering", "Systems Design", "Machine Learning"],
    availability: [
      { day: "Monday", times: "9:00 AM - 2:00 PM" },
      { day: "Wednesday", times: "9:00 AM - 2:00 PM" },
      { day: "Friday", times: "11:00 AM - 4:00 PM" }
    ],
    assignments: [
      { course: "SWE-410 Advanced Software Eng.", time: "Mon/Wed 10:00 AM", term: "Winter 2025" },
      { course: "SWE-200 Intro to SWE", time: "Fri 12:00 PM", term: "Winter 2025" }
    ],
    pastCourses: [
      { course: "SWE-410 Advanced Software Eng.", term: "Fall 2024", students: 45 },
      { course: "SWE-350 Web Development II", term: "Fall 2024", students: 62 },
      { course: "SWE-200 Intro to SWE", term: "Summer 2024", students: 30 }
    ]
  },
  {
    id: "f2", name: "John Doe", role: "Associate Professor", department: "Applied Science", status: "On Leave",
    email: "john.doe@archie.edu", phone: "+1 (555) 987-6543", office: "L-112",
    preferredSubjects: ["Data Structures", "Algorithms", "C++ Programming"],
    availability: [],
    assignments: [],
    pastCourses: [
      { course: "DAT-200 Data Structures", term: "Fall 2024", students: 120 },
      { course: "DAT-300 Algorithms", term: "Spring 2024", students: 85 }
    ]
  },
  {
    id: "f3", name: "Alice Johnson", role: "Lecturer", department: "Business", status: "Active",
    email: "alice.j@archie.edu", phone: "+1 (555) 345-6789", office: "B-405",
    preferredSubjects: ["Intro to Business", "Marketing 101", "Business Ethics"],
    availability: [
      { day: "Tuesday", times: "10:00 AM - 5:00 PM" },
      { day: "Thursday", times: "10:00 AM - 5:00 PM" }
    ],
    assignments: [
      { course: "BUS-101 Intro to Business", time: "Tue/Thu 2:00 PM", term: "Winter 2025" }
    ],
    pastCourses: []
  },
  {
    id: "f4", name: "Bob Martin", role: "Adjunct Faculty", department: "Health Sciences", status: "Active",
    email: "bob.martin@archie.edu", phone: "+1 (555) 234-5678", office: "H-332",
    preferredSubjects: ["Anatomy", "Clinical Practice", "Healthcare Ethics"],
    availability: [
      { day: "Monday", times: "1:00 PM - 6:00 PM" },
      { day: "Wednesday", times: "1:00 PM - 6:00 PM" }
    ],
    assignments: [
      { course: "NUR-400 Clinical Practice IV", time: "Mon/Wed 1:00 PM", term: "Winter 2025" }
    ],
    pastCourses: [
      { course: "NUR-300 Clinical Practice III", term: "Fall 2024", students: 40 },
      { course: "NUR-250 Healthcare Ethics", term: "Spring 2024", students: 110 }
    ]
  },
  {
    id: "f5", name: "Eve Davis", role: "Professor", department: "Media & Creative Arts", status: "Active",
    email: "eve.davis@archie.edu", phone: "+1 (555) 876-5432", office: "M-101",
    preferredSubjects: ["Digital Media Production", "Graphic Design", "UI/UX Design"],
    availability: [
      { day: "Tuesday", times: "9:00 AM - 1:00 PM" },
      { day: "Thursday", times: "9:00 AM - 1:00 PM" },
      { day: "Friday", times: "9:00 AM - 1:00 PM" }
    ],
    assignments: [
      { course: "MED-305 Digital Media Prod.", time: "Tue/Thu 10:00 AM", term: "Winter 2025" }
    ],
    pastCourses: [
      { course: "MED-305 Digital Media Prod.", term: "Fall 2024", students: 35 },
      { course: "MED-100 Graphic Design I", term: "Fall 2024", students: 150 },
      { course: "MED-200 UI/UX Design", term: "Spring 2024", students: 80 }
    ]
  },
]

function FacultyPageInner() {
  const searchParams = useSearchParams()
  const [viewState, setViewState] = React.useState<"directory" | "details">("directory")
  const [selectedFaculty, setSelectedFaculty] = React.useState<Faculty | null>(null)
  const [facultyData, setFacultyData] = React.useState<Faculty[]>(initialFacultyData)

  // Auto-open faculty profile when navigated from the dashboard
  React.useEffect(() => {
    const id = searchParams.get("id")
    if (id) {
      const found = initialFacultyData.find(f => f.id === id)
      if (found) {
        setSelectedFaculty(found)
        setViewState("details")
      }
    }
  }, [searchParams])

  // Add Faculty dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [form, setForm] = React.useState({
    name: "", email: "", phone: "", office: "",
    role: "", department: "", status: "Active",
  })

  const handleFormChange = (field: string, value: string | null) => {
    setForm(prev => ({ ...prev, [field]: value ?? "" }))
  }

  const isFormValid = form.name && form.email && form.role && form.department

  const handleAddFaculty = (e: React.FormEvent) => {
    e.preventDefault()
    const newFaculty: Faculty = {
      id: `f${facultyData.length + 1}`,
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
    setFacultyData(prev => [...prev, newFaculty])
    setIsAddDialogOpen(false)
    setForm({ name: "", email: "", phone: "", office: "", role: "", department: "", status: "Active" })
  }

  const showDetails = (faculty: Faculty) => {
    setSelectedFaculty(faculty)
    setViewState("details")
  }

  if (viewState === "details" && selectedFaculty) {
    return (
      <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full min-h-full pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border/60 pb-6 gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setViewState("directory")} className="rounded-full hover:bg-muted shadow-sm border border-border/40">
              <ArrowLeftIcon className="size-5" />
            </Button>
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-full bg-gradient-to-tr from-primary/80 to-primary/40 flex items-center justify-center text-primary-foreground text-xl font-bold shrink-0 shadow-md">
                {selectedFaculty.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{selectedFaculty.name}</h1>
                <p className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-sm sm:text-base font-medium">
                  <span className="text-foreground/80">{selectedFaculty.role}</span>
                  <span className="text-muted-foreground/30">•</span>
                  <span>{selectedFaculty.department}</span>
                  <span className="text-muted-foreground/30">•</span>
                  <Badge variant="secondary" className={`px-2 py-0 text-xs border-0 ${
                    selectedFaculty.status === "Active"
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                  }`}>
                    {selectedFaculty.status}
                  </Badge>
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl font-medium"><MoreHorizontalIcon className="size-4" /></Button>
            <Button className="rounded-xl font-medium px-6 shadow-md"><MailIcon className="mr-2 size-4" /> Message</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-2">
          {/* Left Column */}
          <div className="flex flex-col gap-6 xl:col-span-1">
            <Card className="shadow-sm border-border/60 bg-card">
              <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-background shadow-sm border border-border/50"><PhoneIcon className="size-3.5 text-foreground" /></span>
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

            <Card className="shadow-sm border-border/60 bg-card">
              <CardHeader className="pb-3 border-b border-border/40 bg-muted/20 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-background shadow-sm border border-border/50"><ClockIcon className="size-3.5 text-foreground" /></span>
                  Teaching Availability
                </CardTitle>
                <Badge variant="outline" className="font-semibold bg-background border-border/60 shadow-sm text-xs">Winter 2025</Badge>
              </CardHeader>
              <CardContent className="pt-4">
                {selectedFaculty.availability.length > 0 ? (
                  <div className="space-y-3">
                    {selectedFaculty.availability.map((avail, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-muted/10">
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
                    <p className="text-muted-foreground text-sm font-medium">No active availability found for this profile.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/60 bg-card">
              <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-background shadow-sm border border-border/50"><BookOpenIcon className="size-3.5 text-foreground" /></span>
                  Preferred Subjects
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 flex flex-wrap gap-2">
                {selectedFaculty.preferredSubjects.length > 0 ? selectedFaculty.preferredSubjects.map(sub => (
                   <Badge key={sub} variant="secondary" className="bg-primary/5 text-primary hover:bg-primary/10 border-primary/10 py-1 px-3 text-sm font-medium">
                     {sub}
                   </Badge>
                )) : (
                  <p className="text-muted-foreground text-sm font-medium">No preferred subjects listed.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6 xl:col-span-2">
            <Card className="shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border-border/60 bg-card">
              <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <BriefcaseIcon className="size-5 text-primary" />
                  Current Enrollments & Assignments
                </CardTitle>
                <Button variant="ghost" size="sm" className="hidden sm:flex text-primary font-medium hover:text-primary hover:bg-primary/10">
                  Add Assignment
                </Button>
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
                        <TableRow key={idx} className="hover:bg-muted/30 transition-colors border-b border-border/30 last:border-0 h-14 cursor-pointer group">
                          <TableCell className="font-bold text-[15px] pl-6 text-foreground/90 w-[45%]">{assignment.course}</TableCell>
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
                     <p className="text-muted-foreground text-sm max-w-sm mt-1 mb-4">This professor doesn&apos;t have any classes scheduled for the upcoming terms.</p>
                     <Button variant="outline" className="shadow-sm">Assign Course Schedule</Button>
                   </div>
                )}
              </CardContent>
            </Card>

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
                        <TableRow key={idx} className="hover:bg-muted/30 transition-colors border-b border-border/30 last:border-0 h-14">
                          <TableCell className="font-medium text-[15px] pl-6 text-foreground/80 w-[45%]">{past.course}</TableCell>
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
                     <p className="text-muted-foreground text-sm font-medium">No historical teaching records found for this faculty member.</p>
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
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500 w-full min-h-full">
      {/* Add Faculty Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-2xl shadow-xl [&>button]:top-4 [&>button]:right-4">
          {/* Dialog Header */}
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
              {/* Row 1: Name + Email */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Full Name <span className="text-destructive">*</span></label>
                  <Input
                    placeholder="e.g. Jane Smith"
                    value={form.name}
                    onChange={e => handleFormChange("name", e.target.value)}
                    className="h-9 rounded-lg border-border/60 bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email Address <span className="text-destructive">*</span></label>
                  <Input
                    type="email"
                    placeholder="jane@archie.edu"
                    value={form.email}
                    onChange={e => handleFormChange("email", e.target.value)}
                    className="h-9 rounded-lg border-border/60 bg-background"
                  />
                </div>
              </div>

              {/* Row 2: Phone + Office */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Phone Number</label>
                  <Input
                    placeholder="+1 (555) 000-0000"
                    value={form.phone}
                    onChange={e => handleFormChange("phone", e.target.value)}
                    className="h-9 rounded-lg border-border/60 bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Office Location</label>
                  <Input
                    placeholder="e.g. L-205"
                    value={form.office}
                    onChange={e => handleFormChange("office", e.target.value)}
                    className="h-9 rounded-lg border-border/60 bg-background"
                  />
                </div>
              </div>

              {/* Row 3: Role + Department */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Role <span className="text-destructive">*</span></label>
                  <Select value={form.role} onValueChange={v => handleFormChange("role", v)}>
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
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Department <span className="text-destructive">*</span></label>
                  <Select value={form.department} onValueChange={v => handleFormChange("department", v)}>
                    <SelectTrigger className="h-9 w-full rounded-lg border-border/60 bg-background">
                      <SelectValue placeholder="Select dept..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="Applied Science">Applied Science</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Health Sciences">Health Sciences</SelectItem>
                        <SelectItem value="Media & Creative Arts">Media & Creative Arts</SelectItem>
                        <SelectItem value="Social & Community Services">Social & Community Services</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 4: Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Employment Status</label>
                <Select value={form.status} onValueChange={v => handleFormChange("status", v)}>
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

            <DialogFooter className="px-6 py-4 border-t border-border/50 bg-muted/20 rounded-b-2xl -mx-0 -mb-0 mt-0">
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

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">Faculty Directory</h1>
          <p className="text-muted-foreground mt-2 text-base max-w-xl">Manage all teaching staff, update roles, and track faculty status and contact details.</p>
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

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="bg-card shadow-sm border-border/60 hover:border-border transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Staff</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-lg"><UsersIcon className="size-4 text-blue-500" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{facultyData.length + 119}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium text-emerald-500">+12% from last year</p>
          </CardContent>
        </Card>
        <Card className="bg-card shadow-sm border-border/60 hover:border-border transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Full-Time</CardTitle>
            <div className="p-2 bg-indigo-500/10 rounded-lg"><CheckCircle2Icon className="size-4 text-indigo-500" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">86</div>
            <p className="text-xs mt-1 font-medium text-emerald-500">69% of workforce</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <div className="flex flex-col gap-5 mt-2">
        <div className="flex items-center gap-3 bg-card p-2 rounded-xl border border-border/60 shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50">
          <div className="relative flex-1 flex items-center">
            <SearchIcon className="absolute left-3 text-muted-foreground size-5" />
            <Input placeholder="Search by name, email, or department..." className="pl-10 bg-transparent h-10 border-none shadow-none focus-visible:ring-0 text-base" />
          </div>
          <div className="w-px h-6 bg-border hidden sm:block" />
          <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border bg-muted/50 px-2 font-mono text-[10px] font-medium text-muted-foreground mr-1">
            <span className="text-xs">⌘</span>F
          </kbd>
        </div>

        <Card className="border border-border/60 shadow-sm overflow-hidden rounded-xl">
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
              {facultyData.map((faculty, i) => (
                <TableRow
                  key={i}
                  onClick={() => showDetails(faculty)}
                  className="h-16 group hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-gradient-to-tr from-primary/80 to-primary/40 flex items-center justify-center text-primary-foreground font-bold shrink-0 shadow-sm">
                        {faculty.name.split(" ").map(n => n[0]).join("")}
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
                    <Badge variant="secondary" className={`px-2.5 py-0.5 text-xs font-medium border-0 ${
                      faculty.status === "Active"
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                    }`}>
                      {faculty.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" onClick={(e) => { e.stopPropagation(); }}>
                        <MailIcon className="size-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity gap-1 font-medium bg-background text-foreground shadow-sm border border-border/50 rounded-lg ml-2">
                        View Profile <ChevronRightIcon className="size-3 text-muted-foreground" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
           </Table>
        </Card>
      </div>
    </div>
  )
}

export default function FacultyPage() {
  return (
    <React.Suspense fallback={null}>
      <FacultyPageInner />
    </React.Suspense>
  )
}

