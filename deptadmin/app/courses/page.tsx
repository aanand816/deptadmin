"use client"

import * as React from "react"
import {
  BookOpenIcon, SearchIcon, FilterIcon, PlusIcon,
  MoreHorizontalIcon, ClockIcon, LayoutGridIcon,
  ArrowLeftIcon, CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon,
  UsersIcon
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

type Course = {
  code: string;
  name: string;
  term: string;
  students: number;
  department: string;
  status: string;
}

type TermRecord = {
  season: string;
  year: number;
  enrolled: number;
  instructor: string;
  status: "Completed" | "Active" | "Cancelled";
}

const initialCourseData: Course[] = [
  { code: "SWE-410", name: "Advanced Software Engineering", term: "Winter 2025", students: 120, department: "Applied Science", status: "Active" },
  { code: "DAT-200", name: "Data Structures & Algorithms", term: "Winter 2025", students: 340, department: "Applied Science", status: "Active" },
  { code: "BUS-101", name: "Introduction to Business", term: "Winter 2025", students: 250, department: "Business", status: "Active" },
  { code: "MED-305", name: "Digital Media Production", term: "Spring 2025", students: 0, department: "Media & Creative Arts", status: "Draft" },
  { code: "NUR-400", name: "Clinical Practice IV", term: "Winter 2025", students: 85, department: "Health Sciences", status: "Active" },
]

const instructorsByDept: Record<string, string[]> = {
  "Applied Science": ["Kyra Smith", "John Doe"],
  "Business": ["Alice Johnson"],
  "Health Sciences": ["Bob Martin"],
  "Media & Creative Arts": ["Eve Davis"],
  "Social & Community Services": ["Sarah Lee"],
}

function generateTermHistory(course: Course): TermRecord[] {
  const seasons = ["Winter", "Summer", "Fall"]
  const years = [2025, 2024, 2023, 2022, 2021, 2020]
  const instructors = instructorsByDept[course.department] ?? ["Staff TBD"]
  const records: TermRecord[] = []

  for (const year of years) {
    for (const season of seasons) {
      // Skip future entries
      if (year === 2025 && (season === "Summer" || season === "Fall")) continue

      const isCurrent = season === "Winter" && year === 2025
      const seed = (season.charCodeAt(0) + year + course.code.charCodeAt(0)) % 7
      const enrolled = isCurrent ? course.students : Math.floor(30 + seed * 18 + (year - 2020) * 5)
      const instructor = instructors[Math.floor((seed + year) % instructors.length)]
      const wasCancelled = !isCurrent && seed === 4

      records.push({
        season,
        year,
        enrolled: wasCancelled ? 0 : enrolled,
        instructor,
        status: isCurrent ? "Active" : wasCancelled ? "Cancelled" : "Completed",
      })
    }
  }

  return records
}

const TERMS_PER_PAGE = 5

export default function CoursesPage() {
  const [viewState, setViewState] = React.useState<"directory" | "details">("directory")
  const [selectedCourse, setSelectedCourse] = React.useState<Course | null>(null)
  const [courseData, setCourseData] = React.useState<Course[]>(initialCourseData)
  const [termsPage, setTermsPage] = React.useState(1)

  // Add Course dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [form, setForm] = React.useState({
    code: "", name: "", department: "", season: "", year: "2025", status: "Active", maxEnrollment: "",
  })

  const handleFormChange = (field: string, value: string | null) => {
    setForm(prev => ({ ...prev, [field]: value ?? "" }))
  }

  const isFormValid = form.code && form.name && form.department && form.season

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault()
    const newCourse: Course = {
      code: form.code.toUpperCase(),
      name: form.name,
      department: form.department,
      term: `${form.season} ${form.year}`,
      students: 0,
      status: form.status,
    }
    setCourseData(prev => [...prev, newCourse])
    setIsAddDialogOpen(false)
    setForm({ code: "", name: "", department: "", season: "", year: "2025", status: "Active", maxEnrollment: "" })
  }

  const showDetails = (course: Course) => {
    setSelectedCourse(course)
    setTermsPage(1)
    setViewState("details")
  }

  // Course detail view
  if (viewState === "details" && selectedCourse) {
    const termHistory = generateTermHistory(selectedCourse)
    const totalPages = Math.ceil(termHistory.length / TERMS_PER_PAGE)
    const pagedTerms = termHistory.slice((termsPage - 1) * TERMS_PER_PAGE, termsPage * TERMS_PER_PAGE)

    return (
      <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full min-h-full pb-10">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-border/60 pb-6">
          <Button variant="ghost" size="icon" onClick={() => setViewState("directory")} className="rounded-full hover:bg-muted shadow-sm border border-border/40">
            <ArrowLeftIcon className="size-5" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-full bg-gradient-to-tr from-primary/80 to-primary/40 flex items-center justify-center text-primary-foreground text-xl font-bold shrink-0 shadow-md">
              {selectedCourse.code.split("-")[0]}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{selectedCourse.name}</h1>
              <p className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-sm sm:text-base font-medium">
                <Badge variant="secondary" className="px-2 py-0 text-xs border-0 bg-emerald-500/10 text-emerald-700">{selectedCourse.status}</Badge>
                <span className="text-foreground/80">{selectedCourse.department}</span>
                <span className="text-foreground/80">{selectedCourse.term}</span>
                <span className="text-foreground/80">{selectedCourse.students} Students</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left: Course Info */}
          <div className="xl:col-span-1">
            <Card className="shadow-sm border-border/60 bg-card">
              <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Course Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {[
                  { label: "Course Code", value: selectedCourse.code },
                  { label: "Course Name", value: selectedCourse.name },
                  { label: "Department", value: selectedCourse.department },
                  { label: "Current Term", value: selectedCourse.term },
                  { label: "Status", value: selectedCourse.status },
                  { label: "Enrolled Students", value: `${selectedCourse.students}` },
                ].map(({ label, value }) => (
                  <div key={label} className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
                    <p className="text-[15px] font-medium text-foreground">{value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right: Terms History */}
          <div className="xl:col-span-2">
            <Card className="shadow-sm border-border/60 bg-card overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/40 bg-muted/10 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <CalendarDaysIcon className="size-5 text-primary" />
                  Term History
                </CardTitle>
                <Badge variant="outline" className="font-semibold bg-background border-border/60 shadow-sm text-xs">
                  {termHistory.length} terms
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/40 bg-muted/20 hover:bg-muted/20">
                      <TableHead className="font-semibold h-11 text-muted-foreground/80 pl-6">Term</TableHead>
                      <TableHead className="font-semibold text-muted-foreground/80">Instructor</TableHead>
                      <TableHead className="font-semibold text-muted-foreground/80 text-center">Enrolled</TableHead>
                      <TableHead className="font-semibold text-muted-foreground/80 text-right pr-6">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedTerms.map((record, idx) => (
                      <TableRow key={idx} className="hover:bg-muted/20 transition-colors border-b border-border/30 last:border-0 h-14">
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-2">
                            <div className={`size-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${
                              record.season === "Winter" ? "bg-blue-500/10 text-blue-600" :
                              record.season === "Summer" ? "bg-amber-500/10 text-amber-600" :
                              "bg-orange-500/10 text-orange-600"
                            }`}>
                              {record.season === "Winter" ? "W" : record.season === "Summer" ? "S" : "F"}
                            </div>
                            <span className="font-bold text-[15px] text-foreground/90">
                              {record.season} <span className="text-muted-foreground font-medium">{record.year}</span>
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium text-foreground/80">{record.instructor}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <UsersIcon className="size-3.5 text-muted-foreground" />
                            <span className="font-bold text-[15px]">{record.enrolled}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Badge variant="secondary" className={`text-[11px] font-semibold uppercase tracking-wider border-0 ${
                            record.status === "Active"
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                              : record.status === "Cancelled"
                              ? "bg-red-500/10 text-red-600 dark:text-red-400"
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {record.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-3 border-t border-border/40 bg-muted/10">
                  <p className="text-xs text-muted-foreground font-medium">
                    Showing {(termsPage - 1) * TERMS_PER_PAGE + 1}–{Math.min(termsPage * TERMS_PER_PAGE, termHistory.length)} of {termHistory.length} terms
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-7 rounded-lg border-border/60"
                      disabled={termsPage === 1}
                      onClick={() => setTermsPage(p => p - 1)}
                    >
                      <ChevronLeftIcon className="size-3.5" />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        variant={termsPage === page ? "default" : "ghost"}
                        size="icon"
                        className={`size-7 rounded-lg text-xs font-semibold ${termsPage === page ? "shadow-sm" : "text-muted-foreground"}`}
                        onClick={() => setTermsPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-7 rounded-lg border-border/60"
                      disabled={termsPage === totalPages}
                      onClick={() => setTermsPage(p => p + 1)}
                    >
                      <ChevronRightIcon className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500 w-full min-h-full">

      {/* Add Course Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-2xl shadow-xl [&>button]:top-4 [&>button]:right-4">
          {/* Dialog Header */}
          <div className="flex items-start gap-3 px-6 py-5 border-b border-border/50 bg-muted/30 pr-12">
            <div className="p-2 bg-purple-500/10 rounded-xl shrink-0 mt-0.5">
              <BookOpenIcon className="size-5 text-purple-600" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground leading-tight">Add New Course</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Register a new course in the catalog across any department and term.
              </DialogDescription>
            </div>
          </div>

          <form onSubmit={handleAddCourse}>
            <div className="px-6 py-5 space-y-4">
              {/* Row 1: Code + Name */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Course Code <span className="text-destructive">*</span></label>
                  <Input
                    placeholder="SWE-410"
                    value={form.code}
                    onChange={e => handleFormChange("code", e.target.value)}
                    className="h-9 rounded-lg border-border/60 bg-background font-mono"
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Course Name <span className="text-destructive">*</span></label>
                  <Input
                    placeholder="e.g. Advanced Software Engineering"
                    value={form.name}
                    onChange={e => handleFormChange("name", e.target.value)}
                    className="h-9 rounded-lg border-border/60 bg-background"
                  />
                </div>
              </div>

              {/* Row 2: Department */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Department <span className="text-destructive">*</span></label>
                <Select value={form.department} onValueChange={v => handleFormChange("department", v)}>
                  <SelectTrigger className="h-9 w-full rounded-lg border-border/60 bg-background">
                    <SelectValue placeholder="Select a department..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Applied Science">Applied Science</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Health Sciences">Health Sciences</SelectItem>
                      <SelectItem value="Media & Creative Arts">Media &amp; Creative Arts</SelectItem>
                      <SelectItem value="Social & Community Services">Social &amp; Community Services</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Row 3: Season + Year */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Term Intake <span className="text-destructive">*</span></label>
                  <Select value={form.season} onValueChange={v => handleFormChange("season", v)}>
                    <SelectTrigger className="h-9 w-full rounded-lg border-border/60 bg-background">
                      <SelectValue placeholder="Season..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="Winter">Winter</SelectItem>
                        <SelectItem value="Summer">Summer</SelectItem>
                        <SelectItem value="Fall">Fall</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Year</label>
                  <Select value={form.year} onValueChange={v => handleFormChange("year", v)}>
                    <SelectTrigger className="h-9 w-full rounded-lg border-border/60 bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="2026">2026</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2024">2024</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 4: Status + Max Enrollment */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</label>
                  <Select value={form.status} onValueChange={v => handleFormChange("status", v)}>
                    <SelectTrigger className="h-9 w-full rounded-lg border-border/60 bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Archived">Archived</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Max Enrollment</label>
                  <Input
                    type="number"
                    placeholder="e.g. 120"
                    value={form.maxEnrollment}
                    onChange={e => handleFormChange("maxEnrollment", e.target.value)}
                    className="h-9 rounded-lg border-border/60 bg-background"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="mx-0 mb-0 px-6 py-4 border-t border-border/50 bg-muted/20 rounded-b-2xl mt-0">
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
                <PlusIcon className="mr-2 size-4" />
                Add Course
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">Course Catalog</h1>
          <p className="text-muted-foreground mt-2 text-base max-w-xl">Browse, create, and manage the university curriculum across all active terms and departments.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="outline" className="hidden sm:flex gap-2 bg-background border-dashed text-foreground/80 hover:text-foreground">
            <FilterIcon className="size-4" />
            Filter Courses
          </Button>
          <Button
            size="lg"
            onClick={() => setIsAddDialogOpen(true)}
            className="rounded-full px-6 shadow-md shadow-primary/20 hover:shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 bg-primary text-primary-foreground font-semibold"
          >
            <PlusIcon className="mr-2 size-5" />
            Add Course
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="bg-card shadow-sm border-border/60 hover:border-border transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Courses</CardTitle>
            <div className="p-2 bg-purple-500/10 rounded-lg"><BookOpenIcon className="size-4 text-purple-500" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">1,245</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium text-emerald-500">+15 new this term</p>
          </CardContent>
        </Card>
        <Card className="bg-card shadow-sm border-border/60 hover:border-border transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Sections</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-lg"><LayoutGridIcon className="size-4 text-blue-500" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">842</div>
            <p className="text-xs mt-1 font-medium text-blue-500">Currently running</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <div className="flex flex-col gap-5 mt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 bg-card p-2 rounded-xl border border-border/60 shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 flex-1 max-w-2xl">
            <div className="relative flex-1 flex items-center">
              <SearchIcon className="absolute left-3 text-muted-foreground size-5" />
              <Input placeholder="Search by course code, name, or department..." className="pl-10 bg-transparent h-10 border-none shadow-none focus-visible:ring-0 text-base" />
            </div>
            <div className="w-px h-6 bg-border hidden sm:block" />
            <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border bg-muted/50 px-2 font-mono text-[10px] font-medium text-muted-foreground mr-1">
              <span className="text-xs">⌘</span>F
            </kbd>
          </div>
        </div>

        <Card className="border border-border/60 shadow-sm overflow-hidden rounded-xl">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border/60">
                <TableHead className="w-[120px] font-semibold text-foreground/80 pl-6 h-12">Code</TableHead>
                <TableHead className="font-semibold text-foreground/80">Course Info</TableHead>
                <TableHead className="font-semibold text-foreground/80">Status & Term</TableHead>
                <TableHead className="text-right font-semibold text-foreground/80 pr-6">Enrollment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courseData.map((course, i) => (
                <TableRow key={i} onClick={() => showDetails(course)} className="h-20 group hover:bg-muted/20 transition-colors cursor-pointer">
                  <TableCell className="pl-6">
                    <Badge variant="outline" className="font-mono font-bold bg-background text-[13px] px-2.5 shadow-sm border-border/80">
                      {course.code}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-[15px] text-foreground/90">{course.name}</span>
                      <span className="text-xs font-semibold text-muted-foreground">{course.department}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2 items-start">
                      <Badge variant="secondary" className={`px-2 py-0 text-[11px] font-semibold uppercase tracking-wider border-0 ${
                        course.status === "Active"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}>
                        {course.status}
                      </Badge>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-foreground/70">
                        <ClockIcon className="size-3" />
                        {course.term}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-3">
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-[15px]">{course.students}</span>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Students</span>
                      </div>
                      <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground" onClick={e => e.stopPropagation()}>
                        <MoreHorizontalIcon className="size-4" />
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
