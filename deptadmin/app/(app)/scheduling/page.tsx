"use client";

import * as React from "react";
import {
  CalendarIcon,
  Building2Icon,
  MapPinIcon,
  SearchIcon,
  FilterIcon,
  Loader2Icon,
  CheckCircle2Icon,
  AlertTriangleIcon,
  Clock3Icon,
  WrenchIcon,
  HashIcon,
  PackageIcon,
  UsersIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  getCampuses,
  getRoomAvailability,
  getRooms,
  getRoomTimetable,
  getTags,
} from "@/lib/facilities-api";
import type {
  Campus,
  Room,
  RoomAvailabilitySlot,
  RoomTag,
  RoomStatus,
} from "@/lib/facilities-types";

function statusBadgeClasses(status: RoomStatus) {
  switch (status) {
    case "AVAILABLE":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-0";
    case "OCCUPIED":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-0";
    case "MAINTENANCE":
      return "bg-red-500/10 text-red-700 dark:text-red-400 border-0";
    default:
      return "bg-muted text-foreground border-0";
  }
}

function statusIcon(status: RoomStatus) {
  switch (status) {
    case "AVAILABLE":
      return <CheckCircle2Icon className="size-4" />;
    case "OCCUPIED":
      return <Clock3Icon className="size-4" />;
    case "MAINTENANCE":
      return <WrenchIcon className="size-4" />;
    default:
      return <AlertTriangleIcon className="size-4" />;
  }
}

export default function SchedulingPage() {
  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [campuses, setCampuses] = React.useState<Campus[]>([]);
  const [tags, setTags] = React.useState<RoomTag[]>([]);

  const [selectedCampusId, setSelectedCampusId] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState<"" | RoomStatus>("");
  const [selectedTagId, setSelectedTagId] = React.useState("");
  const [search, setSearch] = React.useState("");

  const [loadingRooms, setLoadingRooms] = React.useState(true);
  const [loadingSidebar, setLoadingSidebar] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [selectedRoom, setSelectedRoom] = React.useState<Room | null>(null);
  const [roomAvailability, setRoomAvailability] = React.useState<{
    available: boolean;
    reason: RoomStatus;
    currentSlot: RoomAvailabilitySlot | null;
    isFallback: boolean;
  } | null>(null);
  const [roomSchedule, setRoomSchedule] = React.useState<RoomAvailabilitySlot[]>([]);
  const [loadingDetails, setLoadingDetails] = React.useState(false);

  const loadRooms = React.useCallback(async () => {
    try {
      setLoadingRooms(true);
      setError(null);

      const res = await getRooms({
        q: search || undefined,
        campusId: selectedCampusId || undefined,
        status: selectedStatus || undefined,
        tagId: selectedTagId || undefined,
        page: 1,
        limit: 50,
      });

      setRooms(res.data);

      if (res.data.length > 0 && !selectedRoom) {
        setSelectedRoom(res.data[0]);
      }

      if (selectedRoom) {
        const stillExists = res.data.find((room) => room.id === selectedRoom.id);
        if (!stillExists) {
          setSelectedRoom(res.data[0] ?? null);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load rooms");
    } finally {
      setLoadingRooms(false);
    }
  }, [search, selectedCampusId, selectedStatus, selectedTagId, selectedRoom]);

  const loadMeta = React.useCallback(async () => {
    try {
      setLoadingSidebar(true);
      const [campusesRes, tagsRes] = await Promise.all([getCampuses(), getTags()]);
      setCampuses(campusesRes.data);
      setTags(tagsRes.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load filters");
    } finally {
      setLoadingSidebar(false);
    }
  }, []);

  const loadRoomDetails = React.useCallback(async (roomId: string) => {
    try {
      setLoadingDetails(true);
      const [availabilityRes, timetableRes] = await Promise.all([
        getRoomAvailability(roomId),
        getRoomTimetable(roomId),
      ]);

      setRoomAvailability(availabilityRes.data);
      setRoomSchedule(timetableRes.data.slots);
    } catch (err) {
      setRoomAvailability(null);
      setRoomSchedule([]);
      setError(err instanceof Error ? err.message : "Failed to load room details");
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  React.useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      loadRooms();
    }, 250);

    return () => clearTimeout(timer);
  }, [loadRooms]);

  React.useEffect(() => {
    if (selectedRoom?.id) {
      loadRoomDetails(selectedRoom.id);
    } else {
      setRoomAvailability(null);
      setRoomSchedule([]);
    }
  }, [selectedRoom, loadRoomDetails]);

  const availableCount = rooms.filter((room) => room.currentStatus === "AVAILABLE").length;
  const occupiedCount = rooms.filter((room) => room.currentStatus === "OCCUPIED").length;
  const maintenanceCount = rooms.filter((room) => room.currentStatus === "MAINTENANCE").length;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500 w-full min-h-full pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Facilities
          </h1>
          <p className="text-muted-foreground mt-2 text-base max-w-2xl">
            Browse rooms, check real-time availability, and inspect weekly timetable data
            from the Facilities API.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            className="hidden sm:flex gap-2 bg-background border-dashed text-foreground/80 hover:text-foreground"
            onClick={() => {
              setSearch("");
              setSelectedCampusId("");
              setSelectedStatus("");
              setSelectedTagId("");
            }}
          >
            <FilterIcon className="size-4" />
            Reset Filters
          </Button>

          <Button
            size="lg"
            className="rounded-full px-6 shadow-md shadow-primary/20 bg-primary text-primary-foreground font-semibold"
            onClick={() => loadRooms()}
          >
            <CalendarIcon className="mr-2 size-5" />
            Refresh Rooms
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card shadow-sm border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available Rooms
            </CardTitle>
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <CheckCircle2Icon className="size-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{availableCount}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Ready for booking right now
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Occupied Rooms
            </CardTitle>
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Clock3Icon className="size-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{occupiedCount}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Currently in active use
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Under Maintenance
            </CardTitle>
            <div className="p-2 bg-red-500/10 rounded-lg">
              <WrenchIcon className="size-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{maintenanceCount}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Temporarily unavailable
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border/60 shadow-sm">
        <CardContent className="p-4 grid grid-cols-1 lg:grid-cols-4 gap-3">
          <div className="relative lg:col-span-2">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by room number..."
              className="pl-9 h-10 rounded-lg border-border/60 bg-background"
            />
          </div>

          <select
            value={selectedCampusId}
            onChange={(e) => setSelectedCampusId(e.target.value)}
            className="h-10 rounded-lg border border-border/60 bg-background px-3 text-sm"
          >
            <option value="">All campuses</option>
            {campuses.map((campus) => (
              <option key={campus.id} value={campus.id}>
                {campus.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as "" | RoomStatus)}
            className="h-10 rounded-lg border border-border/60 bg-background px-3 text-sm"
          >
            <option value="">All statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="OCCUPIED">Occupied</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>

          <select
            value={selectedTagId}
            onChange={(e) => setSelectedTagId(e.target.value)}
            className="h-10 rounded-lg border border-border/60 bg-background px-3 text-sm lg:col-span-1"
          >
            <option value="">All tags</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.tagName}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {error ? (
        <Card className="border-red-200 bg-red-50/40 dark:bg-red-950/10 dark:border-red-900/50">
          <CardContent className="p-4 text-sm text-red-700 dark:text-red-300">
            {error}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <Card className="xl:col-span-2 border-border/60 shadow-sm overflow-hidden">
          <CardHeader className="border-b border-border/40 bg-muted/20">
            <CardTitle className="text-lg font-bold">Rooms</CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {loadingRooms || loadingSidebar ? (
              <div className="p-8 flex items-center justify-center text-muted-foreground">
                <Loader2Icon className="size-5 animate-spin mr-2" />
                Loading room data...
              </div>
            ) : rooms.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No rooms matched your filters.
              </div>
            ) : (
              <div className="max-h-[780px] overflow-y-auto">
                {rooms.map((room) => {
                  const isActive = selectedRoom?.id === room.id;
                  return (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      className={`w-full text-left p-4 border-b border-border/40 transition-colors ${
                        isActive ? "bg-primary/5" : "hover:bg-muted/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-base text-foreground">
                              {room.roomNumber}
                            </h3>
                            <Badge
                              variant="secondary"
                              className={statusBadgeClasses(room.currentStatus)}
                            >
                              <span className="inline-flex items-center gap-1">
                                {statusIcon(room.currentStatus)}
                                {room.currentStatus}
                              </span>
                            </Badge>
                          </div>

                          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                            <p className="flex items-center gap-1.5">
                              <Building2Icon className="size-4" />
                              {room.building.name} ({room.building.buildingCode})
                            </p>
                            <p className="flex items-center gap-1.5">
                              <MapPinIcon className="size-4" />
                              {room.building.campus?.name ?? "Unknown campus"}
                            </p>
                            <p className="flex items-center gap-1.5">
                              <UsersIcon className="size-4" />
                              Capacity {room.capacity} • Floor {room.floor}
                            </p>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <Badge variant="outline" className="bg-background">
                              {room.roomType}
                            </Badge>
                            {room.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag.id}
                                className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
                                style={{
                                  backgroundColor: `${tag.colorCode}18`,
                                  color: tag.colorCode,
                                }}
                              >
                                {tag.tagName}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="xl:col-span-3 flex flex-col gap-6">
          {!selectedRoom ? (
            <Card className="border-border/60 shadow-sm min-h-[320px] flex items-center justify-center">
              <CardContent className="text-center text-muted-foreground">
                Select a room to view live availability and timetable.
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="border-b border-border/40 bg-muted/20">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-xl font-bold">
                        Room {selectedRoom.roomNumber}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedRoom.building.name} •{" "}
                        {selectedRoom.building.campus?.name ?? "Unknown campus"}
                      </p>
                    </div>

                    <Badge
                      variant="secondary"
                      className={statusBadgeClasses(selectedRoom.currentStatus)}
                    >
                      <span className="inline-flex items-center gap-1">
                        {statusIcon(selectedRoom.currentStatus)}
                        {selectedRoom.currentStatus}
                      </span>
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-border/50 bg-muted/10 p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Capacity
                    </p>
                    <p className="text-2xl font-bold mt-1">{selectedRoom.capacity}</p>
                  </div>

                  <div className="rounded-xl border border-border/50 bg-muted/10 p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Room Type
                    </p>
                    <p className="text-2xl font-bold mt-1">{selectedRoom.roomType}</p>
                  </div>

                  <div className="rounded-xl border border-border/50 bg-muted/10 p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Assets
                    </p>
                    <p className="text-2xl font-bold mt-1">{selectedRoom.assets.length}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/60 shadow-sm">
                <CardHeader className="border-b border-border/40 bg-muted/20">
                  <CardTitle className="text-lg font-bold">Live Availability</CardTitle>
                </CardHeader>

                <CardContent className="pt-5">
                  {loadingDetails ? (
                    <div className="flex items-center text-muted-foreground">
                      <Loader2Icon className="size-5 animate-spin mr-2" />
                      Loading live room status...
                    </div>
                  ) : roomAvailability ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge
                          variant="secondary"
                          className={statusBadgeClasses(roomAvailability.reason)}
                        >
                          {roomAvailability.available ? "Free right now" : roomAvailability.reason}
                        </Badge>

                        {roomAvailability.isFallback ? (
                          <Badge variant="outline" className="text-amber-600 border-amber-300">
                            Scheduler fallback in use
                          </Badge>
                        ) : null}
                      </div>

                      {roomAvailability.currentSlot ? (
                        <div className="rounded-xl border border-border/50 bg-muted/10 p-4">
                          <p className="font-semibold text-foreground">
                            {roomAvailability.currentSlot.courseCode} —{" "}
                            {roomAvailability.currentSlot.courseName}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Instructor: {roomAvailability.currentSlot.instructor}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {roomAvailability.currentSlot.dayOfWeek} •{" "}
                            {roomAvailability.currentSlot.startTime} -{" "}
                            {roomAvailability.currentSlot.endTime}
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-border/50 bg-muted/10 p-4 text-sm text-muted-foreground">
                          No active class occupying this room right now.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No live availability data found.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/60 shadow-sm">
                <CardHeader className="border-b border-border/40 bg-muted/20">
                  <CardTitle className="text-lg font-bold">Weekly Timetable</CardTitle>
                </CardHeader>

                <CardContent className="pt-5">
                  {loadingDetails ? (
                    <div className="flex items-center text-muted-foreground">
                      <Loader2Icon className="size-5 animate-spin mr-2" />
                      Loading timetable...
                    </div>
                  ) : roomSchedule.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No timetable slots were returned for this room.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {roomSchedule.map((slot, index) => (
                        <div
                          key={`${slot.courseCode}-${slot.dayOfWeek}-${slot.startTime}-${index}`}
                          className="rounded-xl border border-border/50 bg-background p-4 shadow-sm"
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <div>
                              <p className="font-semibold text-foreground">
                                {slot.courseCode} — {slot.courseName}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {slot.instructor}
                              </p>
                            </div>

                            <div className="text-sm text-muted-foreground font-medium">
                              {slot.dayOfWeek} • {slot.startTime} - {slot.endTime}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/60 shadow-sm">
                <CardHeader className="border-b border-border/40 bg-muted/20">
                  <CardTitle className="text-lg font-bold">Room Metadata</CardTitle>
                </CardHeader>

                <CardContent className="pt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedRoom.tags.length > 0 ? (
                        selectedRoom.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium"
                            style={{
                              backgroundColor: `${tag.colorCode}18`,
                              color: tag.colorCode,
                            }}
                          >
                            <HashIcon className="size-3" />
                            {tag.tagName}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No tags assigned.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                      Assets
                    </p>
                    <div className="space-y-2">
                      {selectedRoom.assets.length > 0 ? (
                        selectedRoom.assets.map((asset) => (
                          <div
                            key={asset.id}
                            className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/10 px-3 py-2"
                          >
                            <div className="flex items-center gap-2">
                              <PackageIcon className="size-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{asset.itemName}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Qty {asset.quantity} •{" "}
                              {asset.isFunctional ? "Functional" : "Not functional"}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No assets recorded.</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}