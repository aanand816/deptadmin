"use client"

import * as React from "react"
import { 
  BookOpenIcon, SearchIcon, FilterIcon, PlusIcon, 
  MoreHorizontalIcon, ClockIcon, UsersIcon, LayoutGridIcon,
  GraduationCapIcon, ArrowLeftIcon
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function CoursesPage() {
  const [viewState, setViewState] = React.useState<'directory' | 'details'>('directory');
  const [selectedCourse, setSelectedCourse] = React.useState<any>(null);

  const courseData = [
    { code: "SWE-410", name: "Advanced Software Engineering", term: "Winter 2025", students: 120, department: "Applied Science", status: "Active" },
    { code: "DAT-200", name: "Data Structures & Algorithms", term: "Winter 2025", students: 340, department: "Applied Science", status: "Active" },
    { code: "BUS-101", name: "Introduction to Business", term: "Winter 2025", students: 250, department: "Business", status: "Active" },
    { code: "MED-305", name: "Digital Media Production", term: "Spring 2025", students: 0, department: "Media & Creative Arts", status: "Draft" },
    { code: "NUR-400", name: "Clinical Practice IV", term: "Winter 2025", students: 85, department: "Health Sciences", status: "Active" },
  ];

  const showDetails = (course:any) => {
    setSelectedCourse(course);
    setViewState('details');
  };

  if (viewState === 'details' && selectedCourse) {
    return (
      <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full min-h-full pb-10">
        <div className="flex items-center gap-4 border-b border-border/60 pb-6">
          <Button variant="ghost" size="icon" onClick={() => setViewState('directory')} className="rounded-full hover:bg-muted shadow-sm border border-border/40">
            <ArrowLeftIcon className="size-5" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-full bg-gradient-to-tr from-primary/80 to-primary/40 flex items-center justify-center text-primary-foreground text-xl font-bold shrink-0 shadow-md">
              {selectedCourse.code.split('-')[0]}
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
        {/* Additional details could be added here, such as syllabus, instructor, etc. */}
        <Card className="shadow-sm border-border/60 bg-card">
          <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Course Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-2">
            <p><strong>Code:</strong> {selectedCourse.code}</p>
            <p><strong>Name:</strong> {selectedCourse.name}</p>
            <p><strong>Department:</strong> {selectedCourse.department}</p>
            <p><strong>Term:</strong> {selectedCourse.term}</p>
            <p><strong>Status:</strong> {selectedCourse.status}</p>
            <p><strong>Enrolled Students:</strong> {selectedCourse.students}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500 w-full min-h-full">
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
          <Button size="lg" className="rounded-full px-6 shadow-md shadow-primary/20 hover:shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 bg-primary text-primary-foreground font-semibold">
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
                      <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground">
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
  );
}
