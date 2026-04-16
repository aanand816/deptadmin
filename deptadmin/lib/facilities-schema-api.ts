export async function getCampusesSchema() {
  const res = await fetch("/api/facilities_schema/campuses", { cache: "no-store" })
  let body = null
  try { body = await res.json() } catch (e) { body = null }
  if (!res.ok) throw new Error(body?.error ?? `Request failed with status ${res.status}`)
  return body
}

export async function getBuildingsSchema() {
  const res = await fetch("/api/facilities_schema/buildings", { cache: "no-store" })
  let body = null
  try { body = await res.json() } catch (e) { body = null }
  if (!res.ok) throw new Error(body?.error ?? `Request failed with status ${res.status}`)
  return body
}

export async function getRoomsSchema() {
  const res = await fetch("/api/facilities_schema/rooms", { cache: "no-store" })
  let body = null
  try { body = await res.json() } catch (e) { body = null }
  if (!res.ok) throw new Error(body?.error ?? `Request failed with status ${res.status}`)
  return body
}

export async function getTagsSchema() {
  const res = await fetch("/api/facilities_schema/tags", { cache: "no-store" })
  let body = null
  try { body = await res.json() } catch (e) { body = null }
  if (!res.ok) throw new Error(body?.error ?? `Request failed with status ${res.status}`)
  return body
}

export default { getCampusesSchema, getBuildingsSchema, getRoomsSchema, getTagsSchema }
