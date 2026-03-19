"use client"

import * as React from "react"
import { 
  CalendarIcon, PlusIcon, FilterIcon, MoreHorizontalIcon, UsersIcon
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function SchedulingPage() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500 w-full min-h-full">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">Term Scheduling</h1>
          <p className="text-muted-foreground mt-2 text-base max-w-xl">Organize the academic calendar, set up time slots, and manage room allocations.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="outline" className="hidden sm:flex gap-2 bg-background border-dashed text-foreground/80 hover:text-foreground">
            <FilterIcon className="size-4" />
            Filter Schedule
          </Button>
          <Button size="lg" className="rounded-full px-6 shadow-md shadow-primary/20 hover:shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 bg-primary text-primary-foreground font-semibold">
            <PlusIcon className="mr-2 size-5" />
            Create Event
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        <Card className="col-span-1 border-border/60 shadow-sm bg-card md:col-span-2 min-h-[500px] flex items-center justify-center border-dashed border-2">
           <div className="text-center flex flex-col items-center max-w-sm">
             <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 shadow-sm ring-4 ring-primary/5">
               <CalendarIcon className="size-8" />
             </div>
             <h3 className="text-xl font-bold tracking-tight text-foreground">Calendar View</h3>
             <p className="text-muted-foreground mt-2 font-medium">Connect a scheduling calendar instance or select a term to display blocks and course events.</p>
             <Button className="mt-6 font-semibold shadow-sm w-full">Set Up Calendar</Button>
           </div>
        </Card>
        
        <div className="col-span-1 flex flex-col gap-4">
          <h2 className="text-lg font-bold tracking-tight">Upcoming Deadlines</h2>
          {[
            { title: "Winter 2025 Start", date: "Jan 10, 2025", type: "system" },
            { title: "Add/Drop Deadline", date: "Jan 24, 2025", type: "student" },
            { title: "Midterm Weeks", date: "Mar 1 - Mar 15", type: "academic" },
            { title: "Final Grade Submission", date: "May 2, 2025", type: "faculty" },
          ].map((item, i) => (
            <Card key={i} className="bg-card shadow-sm border-border/60 hover:border-border transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                 <div>
                   <h4 className="font-bold text-sm">{item.title}</h4>
                   <p className="text-xs font-semibold text-muted-foreground mt-1">{item.date}</p>
                 </div>
                 <Button variant="ghost" size="icon" className="size-8">
                   <MoreHorizontalIcon className="size-4" />
                 </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
