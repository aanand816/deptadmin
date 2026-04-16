"use client"

import * as React from "react"
import {
  BookOpenIcon,
  SearchIcon,
  FilterIcon,
  GraduationCapIcon,
  Loader2Icon,
  BuildingIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCourses, getDepartments } from "@/lib/course-api"

type Course = {
  id: string
  name: string
  code: string
  credits?: number | null
  status?: string | null
  departmentId?: string | null
  department_name?: string | null
  program_name?: string | null
}

type Department = {
  id: string
  name: string
}

export default function CoursesPage() {
  const [courses, setCourses] = React.useState<Course[]>([])
  const [departments, setDepartments] = React.useState<Department[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedDepartment, setSelectedDepartment] = React.useState("")
  const [selectedStatus, setSelectedStatus] = React.useState("")

  React.useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true)
        setError(null)

        const [coursesRes, departmentsRes] = await Promise.all([
          getCourses(),
          getDepartments(),
        ])

        setCourses(coursesRes.data ?? [])
        setDepartments(departmentsRes.data ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load course data")
      } finally {
        setLoading(false)
      }
    }

    loadCourses()
  }, [])

  const filteredCourses = courses.filter((course) => {
    const q = searchQuery.trim().toLowerCase()
    const matchesSearch = !q || [
      course.code,
      course.name,
      course.department_name,
      course.program_name,
    ].some((value) => value?.toLowerCase().includes(q))

    const matchesDepartment = !selectedDepartment || course.department_name === selectedDepartment
    const matchesStatus = !selectedStatus || course.status === selectedStatus

    return matchesSearch && matchesDepartment && matchesStatus
  })

  const uniqueDepartments = new Set(courses.map((c) => c.department_name).filter(Boolean)).size
  const activeCount = courses.filter((c) => c.status?.toLowerCase() === "active").length
  const statusOptions = [...new Set(courses.map((c) => c.status).filter((s): s is string => !!s))]

  function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
    const s = status?.toLowerCase()
    if (s === "active") return "default"
    if (s === "inactive") return "secondary"
    return "outline"
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500 w-full min-h-full pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Course Catalog
          </h1>
          <p className="text-muted-foreground mt-2 text-base max-w-2xl">
            All courses registered in the department database.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button variant="outline" className="hidden sm:flex gap-2 bg-background border-dashed text-foreground/80 hover:text-foreground">
            <FilterIcon className="size-4" />
            Filters Active
          </Button>
          <Button
            size="lg"
            className="rounded-full px-6 shadow-md shadow-primary/20 bg-primary text-primary-foreground font-semibold"
            onClick={() => window.location.reload()}
          >
            <BookOpenIcon className="mr-2 size-5" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <Card className="bg-card shadow-sm border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Courses</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <GraduationCapIcon className="size-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{courses.length}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Courses in the database</p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Courses</CardTitle>
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <BookOpenIcon className="size-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{activeCount}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Currently active</p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Departments</CardTitle>
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <BuildingIcon className="size-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{uniqueDepartments}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Departments offering courses</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border/60 shadow-sm">
        <CardContent className="p-4 grid grid-cols-1 lg:grid-cols-4 gap-3">
          <div className="relative lg:col-span-2">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by code, name, department, program..."
              className="pl-9 h-10 rounded-lg border-border/60 bg-background"
            />
          </div>

          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="h-10 rounded-lg border border-border/60 bg-background px-3 text-sm"
          >
            <option value="">All departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.name}>
                {dept.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 rounded-lg border border-border/60 bg-background px-3 text-sm"
          >
            <option value="">All statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {loading ? (
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-8 flex items-center justify-center text-muted-foreground">
            <Loader2Icon className="size-5 animate-spin mr-2" />
            Loading courses from database...
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-red-200 bg-red-50/40 dark:bg-red-950/10 dark:border-red-900/50">
          <CardContent className="p-4 text-sm text-red-700 dark:text-red-300">
            {error}
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-border/60 shadow-sm overflow-hidden rounded-xl">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border/60">
                <TableHead className="font-semibold text-foreground/80 pl-6 h-12">Course</TableHead>
                <TableHead className="font-semibold text-foreground/80">Department</TableHead>
                <TableHead className="font-semibold text-foreground/80">Program</TableHead>
                <TableHead className="font-semibold text-foreground/80">Credits</TableHead>
                <TableHead className="text-right font-semibold text-foreground/80 pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow key={course.id} className="h-16 group hover:bg-muted/30 transition-colors">
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-gradient-to-tr from-primary/80 to-primary/40 flex items-center justify-center text-primary-foreground font-bold shrink-0 shadow-sm">
                        <BookOpenIcon className="size-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-[15px]">{course.code}</span>
                        <span className="text-xs text-muted-foreground font-medium">{course.name}</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="text-sm font-medium text-foreground/90">
                      {course.department_name ?? "—"}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {course.program_name ?? "—"}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span className="text-sm font-semibold">{course.credits}</span>
                  </TableCell>

                  <TableCell className="text-right pr-6">
                    <Badge variant={statusVariant(course.status ?? "")} className="font-medium capitalize">
                      {course.status ?? "—"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredCourses.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No courses matched your filters.
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
