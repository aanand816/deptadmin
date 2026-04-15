import type {
  BuildingsResponse,
  CampusesResponse,
  PaginatedRoomsResponse,
  RoomAssetsResponse,
  RoomAvailabilityResponse,
  RoomDetailResponse,
  RoomStatus,
  RoomTimetableResponse,
  TagsResponse,
} from "./facilities-types"

type GetRoomsParams = {
  q?: string
  status?: RoomStatus
  campusId?: string
  buildingId?: string
  tagId?: string
  page?: number
  limit?: number
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  // Strip /api/ prefix — proxy base already resolves to upstream /api/
  const normalised = path.replace(/^\/api\//, "/")
  const url = `/api/facilities${normalised}`

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })

  if (!res.ok) {
    let message = "Request failed"
    try {
      const json = await res.json()
      if (json?.error) message = json.error
    } catch {}
    throw new Error(message)
  }

  return res.json()
}

function buildRoomsQuery(params: GetRoomsParams = {}) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value))
    }
  })
  const query = search.toString()
  return query ? `/api/rooms?${query}` : "/api/rooms"
}

export async function getRooms(params: GetRoomsParams = {}) {
  return apiFetch<PaginatedRoomsResponse>(buildRoomsQuery(params))
}

export async function getRoomDetail(id: string) {
  return apiFetch<RoomDetailResponse>(`/api/rooms/${id}`)
}

export async function getRoomAvailability(id: string) {
  return apiFetch<RoomAvailabilityResponse>(`/api/rooms/${id}/availability`, {
    cache: "no-store",
  })
}

export async function getRoomTimetable(id: string) {
  return apiFetch<RoomTimetableResponse>(`/api/rooms/${id}/timetable`)
}

export async function getRoomAssets(id: string) {
  return apiFetch<RoomAssetsResponse>(`/api/rooms/${id}/assets`)
}

export async function getBuildings() {
  return apiFetch<BuildingsResponse>("/api/buildings")
}

export async function getCampuses() {
  return apiFetch<CampusesResponse>("/api/campuses")
}

export async function getTags() {
  return apiFetch<TagsResponse>("/api/tags")
}