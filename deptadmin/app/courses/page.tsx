"use client"

import * as React from "react"
import {
  BookOpenIcon,
  SearchIcon,
  FilterIcon,
  Building2Icon,
  CalendarDaysIcon,
  Clock3Icon,
  UserIcon,
  Loader2Icon,
  GraduationCapIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCampuses, getRoomTimetable, getRooms } from "@/lib/facilities-api"
import type { Campus, Room } from "@/lib/facilities-types"

type DerivedCourseRow = {
  id: string
  roomId: string
  roomNumber: string
  buildingName: string
  buildingCode: string
  campusName: string
  courseCode: string
  courseName: string
  instructor: string
  dayOfWeek: string
  startTime: string
  endTime: string
}

const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

function compareDay(a: string, b: string) {
  return DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b)
}

export default function CoursesPage() {
  const [courses, setCourses] = React.useState<DerivedCourseRow[]>([])
  const [campuses, setCampuses] = React.useState<Campus[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCampus, setSelectedCampus] = React.useState("")
  const [selectedDay, setSelectedDay] = React.useState("")

  React.useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true)
        setError(null)

        const [roomsRes, campusesRes] = await Promise.all([
          getRooms({ limit: 20 }),
          getCampuses(),
        ])

        setCampuses(campusesRes.data)

        const rows = await Promise.all(
          roomsRes.data.map(async (room: Room) => {
            try {
              const timetableRes = await getRoomTimetable(room.id)
              return timetableRes.data.slots.map((slot, index) => ({
                id: `${room.id}-${slot.courseCode}-${slot.dayOfWeek}-${slot.startTime}-${index}`,
                roomId: room.id,
                roomNumber: room.roomNumber,
                buildingName: room.building.name,
                buildingCode: room.building.buildingCode,
                campusName: room.building.campus?.name ?? "Unknown campus",
                courseCode: slot.courseCode,
                courseName: slot.courseName,
                instructor: slot.instructor,
                dayOfWeek: slot.dayOfWeek,
                startTime: slot.startTime,
                endTime: slot.endTime,
              }))
            } catch {
              return []
            }
          })
        )

        const flattened = rows
          .flat()
          .sort((a, b) => compareDay(a.dayOfWeek, b.dayOfWeek) || a.startTime.localeCompare(b.startTime))

        setCourses(flattened)
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
      course.courseCode,
      course.courseName,
      course.instructor,
      course.roomNumber,
      course.buildingName,
      course.campusName,
    ].some((value) => value.toLowerCase().includes(q))

    const matchesCampus = !selectedCampus || course.campusName === selectedCampus
    const matchesDay = !selectedDay || course.dayOfWeek === selectedDay

    return matchesSearch && matchesCampus && matchesDay
  })

  const uniqueCourses = new Set(courses.map((course) => course.courseCode)).size
  const uniqueInstructors = new Set(courses.map((course) => course.instructor)).size
  const uniqueRooms = new Set(courses.map((course) => course.roomId)).size

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500 w-full min-h-full pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Course Catalog
          </h1>
          <p className="text-muted-foreground mt-2 text-base max-w-2xl">
            Live course schedule rows derived from facilities room timetable data.
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Distinct Courses</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <GraduationCapIcon className="size-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{uniqueCourses}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Unique course codes found</p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Instructors</CardTitle>
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <UserIcon className="size-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{uniqueInstructors}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Names extracted from timetables</p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Teaching Rooms</CardTitle>
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Building2Icon className="size-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{uniqueRooms}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Rooms contributing course slots</p>
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
              placeholder="Search by code, name, instructor, room, building..."
              className="pl-9 h-10 rounded-lg border-border/60 bg-background"
            />
          </div>

          <select
            value={selectedCampus}
            onChange={(e) => setSelectedCampus(e.target.value)}
            className="h-10 rounded-lg border border-border/60 bg-background px-3 text-sm"
          >
            <option value="">All campuses</option>
            {campuses.map((campus) => (
              <option key={campus.id} value={campus.name}>
                {campus.name}
              </option>
            ))}
          </select>

          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="h-10 rounded-lg border border-border/60 bg-background px-3 text-sm"
          >
            <option value="">All days</option>
            {DAY_ORDER.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {loading ? (
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-8 flex items-center justify-center text-muted-foreground">
            <Loader2Icon className="size-5 animate-spin mr-2" />
            Loading course data from room timetables...
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
                <TableHead className="font-semibold text-foreground/80">Instructor</TableHead>
                <TableHead className="font-semibold text-foreground/80">Schedule</TableHead>
                <TableHead className="font-semibold text-foreground/80">Location</TableHead>
                <TableHead className="text-right font-semibold text-foreground/80 pr-6">Campus</TableHead>
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
                        <span className="font-bold text-[15px]">{course.courseCode}</span>
                        <span className="text-xs text-muted-foreground font-medium">{course.courseName}</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground/90">
                      <UserIcon className="size-4 text-muted-foreground" />
                      {course.instructor}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/90">
                        <CalendarDaysIcon className="size-4 text-muted-foreground" />
                        {course.dayOfWeek}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock3Icon className="size-3.5" />
                        {course.startTime} - {course.endTime}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-sm">{course.roomNumber}</span>
                      <span className="text-xs text-muted-foreground">
                        {course.buildingName} ({course.buildingCode})
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-right pr-6">
                    <Badge variant="secondary" className="bg-muted text-foreground/80 border border-border/40 shadow-sm font-medium">
                      {course.campusName}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredCourses.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No course timetable rows matched your filters.
            </div>
          )}
        </Card>
      )}
    </div>
  )
}