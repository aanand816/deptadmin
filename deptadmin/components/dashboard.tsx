"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  SearchIcon, PlusIcon, GraduationCapIcon, ArrowLeftIcon, 
  BookOpenIcon, ClockIcon, UsersIcon, LayoutDashboardIcon, 
  SettingsIcon, LogOutIcon, BellIcon, MenuIcon, XIcon,
  ChevronDownIcon, BriefcaseIcon, CalendarIcon, FolderOpenIcon,
  FilterIcon, ChevronRightIcon, MoreHorizontalIcon, UserPlusIcon
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

export function Dashboard() {
  const router = useRouter()

  // Original term selector modal state
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  
  // New Add Faculty modal state
  const [isAssignFacultyOpen, setIsAssignFacultyOpen] = React.useState(false)
  const [selectedFaculty, setSelectedFaculty] = React.useState("")
  const [selectedSubject, setSelectedSubject] = React.useState("")

  const [viewState, setViewState] = React.useState<"dashboard" | "details">("dashboard")
  
  const [year, setYear] = React.useState<string>("2025")
  const [term, setTerm] = React.useState<string>("Winter")

  const [activeDepartment, setActiveDepartment] = React.useState<string>("Faculty of Applied Science and Technology")

  const [assignedFaculty, setAssignedFaculty] = React.useState([
    { id: "f1", name: "Kyra Smith", course: "Software Engineering", time: "Mon/Wed 10:00 AM", load: "Full-Time" },
    { id: "f2", name: "John Doe", course: "Data Structures", time: "Tue/Thu 2:00 PM", load: "Part-Time" },
    { id: "f3", name: "Alice Johnson", course: "Web Development", time: "Fri 9:00 AM", load: "Full-Time" },
    { id: "f4", name: "Bob Martin", course: "Database Management", time: "Mon/Wed 1:00 PM", load: "Part-Time" },
    { id: "f5", name: "Eve Davis", course: "Network Security", time: "Tue/Thu 10:00 AM", load: "Full-Time" },
    { id: "", name: "Michael Chang", course: "Machine Learning", time: "Mon/Wed 3:00 PM", load: "Full-Time" },
  ])

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

  const handleGoToDetails = (e: React.FormEvent) => {
    e.preventDefault()
    setIsDialogOpen(false)
    setViewState("details")
  }

  const handleAddFacultySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Mock randomly fetching a time
    const mockTimes = ["Mon/Wed 10:00 AM", "Tue/Thu 2:00 PM", "Fri 9:00 AM", "Mon/Wed 1:00 PM", "Tue/Thu 10:00 AM", "Fri 1:00 PM"];
    const randomTime = mockTimes[Math.floor(Math.random() * mockTimes.length)];
    
    setAssignedFaculty(prev => [...prev, {
      id: "",
      name: selectedFaculty || "Selected Professor",
      course: selectedSubject || "Assigned Subject",
      time: randomTime,
      load: "Full-Time"
    }])
    
    setIsAssignFacultyOpen(false)
    setSelectedFaculty("")
    setSelectedSubject("")
  }

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
                    <Badge variant={teacher.load === "Full-Time" ? "default" : "secondary"} className="font-medium shadow-none">
                      {teacher.load}
                    </Badge>
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


      <Dialog open={isAssignFacultyOpen} onOpenChange={setIsAssignFacultyOpen}>
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-border/80 shadow-lg rounded-2xl">
          <div className="p-6 bg-muted/10 border-b border-border/60">
            <DialogHeader className="mb-0">
              <DialogTitle className="text-2xl flex items-center gap-3 font-bold">
                <div className="bg-primary/10 p-2.5 rounded-xl text-primary shadow-sm">
                  <UserPlusIcon className="size-5" />
                </div>
                Assign Professor to Subject
              </DialogTitle>
              <DialogDescription className="pt-3 text-[15px] font-medium text-muted-foreground/80">
                Select a faculty member and the subject they will teach. The system will automatically fetch their available teaching times.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6">
            <form onSubmit={handleAddFacultySubmit} className="space-y-6">
              <FieldGroup className="space-y-5">
                <Field className="space-y-2.5">
                  <FieldLabel htmlFor="faculty" className="font-semibold text-foreground/80">Select Faculty</FieldLabel>
                  <Select value={selectedFaculty} onValueChange={(val) => setSelectedFaculty(val || "")} required>
                    <SelectTrigger id="faculty" className="h-11 bg-muted/30 border-border/60 rounded-xl">
                      <SelectValue placeholder="Choose a professor..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/80 shadow-md">
                      <SelectGroup className="p-1">
                        {["Dr. Sarah Jenkins", "Prof. Mark Thompson", "Dr. Emily Chen", "Dr. Robert Wilson", "Prof. Lisa Rodriguez"].map(f => (
                          <SelectItem key={f} value={f} className="rounded-lg mb-0.5 cursor-pointer focus:bg-primary/10 focus:text-primary">{f}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                <Field className="space-y-2.5">
                  <FieldLabel htmlFor="subject" className="font-semibold text-foreground/80">Select Subject</FieldLabel>
                  <Select value={selectedSubject} onValueChange={(val) => setSelectedSubject(val || "")} required>
                    <SelectTrigger id="subject" className="h-11 bg-muted/30 border-border/60 rounded-xl">
                      <SelectValue placeholder="Choose a subject..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/80 shadow-md">
                      <SelectGroup className="p-1">
                        {["Advanced Algorithms", "Computer Networks", "Database Management", "Operating Systems", "Cloud Computing"].map(s => (
                          <SelectItem key={s} value={s} className="rounded-lg mb-0.5 cursor-pointer focus:bg-primary/10 focus:text-primary">{s}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>
              
              <DialogFooter className="mt-8 gap-2 sm:gap-0 pt-4 border-t border-border/40">
                <Button type="button" variant="ghost" onClick={() => setIsAssignFacultyOpen(false)} className="rounded-xl font-medium hover:bg-muted">
                  Cancel
                </Button>
                <Button type="submit" disabled={!selectedFaculty || !selectedSubject} className="rounded-xl font-semibold shadow-sm px-6">
                  Add Faculty <ChevronRightIcon className="ml-2 size-4" />
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
