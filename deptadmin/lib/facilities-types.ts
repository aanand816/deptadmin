export type RoomStatus = "AVAILABLE" | "OCCUPIED" | "MAINTENANCE"

export type Campus = {
  id: string
  name: string
  address: string
  timezone?: string
}

export type Building = {
  id: string
  name: string
  buildingCode: string
  campusId?: string
  campus?: Campus
  createdAt?: string
  updatedAt?: string
}

export type RoomTag = {
  id: string
  tagName: string
  colorCode: string
  createdAt?: string
}

export type RoomAsset = {
  id: string
  roomId?: string
  itemName: string
  quantity: number
  isFunctional: boolean
  createdAt?: string
  updatedAt?: string
}

export type MaintenanceLog = {
  id?: string
  title?: string
  description?: string
  status?: string
  createdAt?: string
  updatedAt?: string
}

export type Room = {
  id: string
  roomNumber: string
  floor: number
  capacity: number
  roomType: string
  description: string | null
  currentStatus: RoomStatus
  archivedAt?: string | null
  createdAt?: string
  updatedAt?: string
  building: Building & {
    campus?: Campus
  }
  tags: RoomTag[]
  assets: RoomAsset[]
  maintenanceLogs?: MaintenanceLog[]
}

export type PaginatedRoomsResponse = {
  data: Room[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type RoomAvailabilitySlot = {
  courseCode: string
  courseName: string
  instructor: string
  dayOfWeek: string
  startTime: string
  endTime: string
}

export type RoomAvailabilityResponse = {
  data: {
    roomId: string
    available: boolean
    reason: RoomStatus
    currentSlot: RoomAvailabilitySlot | null
    isFallback: boolean
  }
}

export type RoomTimetableResponse = {
  data: {
    roomId: string
    isFallback: boolean
    slots: RoomAvailabilitySlot[]
  }
}

export type RoomDetailResponse = {
  data: Room
}

export type CampusesResponse = {
  data: Campus[]
}

export type BuildingsResponse = {
  data: Building[]
}

export type TagsResponse = {
  data: RoomTag[]
}

export type RoomAssetsResponse = {
  data: RoomAsset[]
}