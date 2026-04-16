export async function getDepartmentsSchema() {
  const res = await fetch("/api/faculty_schema/department", { cache: "no-store" })
  let body = null
  try { body = await res.json() } catch (e) { body = null }
  if (!res.ok) throw new Error(body?.error ?? `Request failed with status ${res.status}`)
  return body
}

export async function getCoursesSchema() {
  const res = await fetch("/api/faculty_schema/course", { cache: "no-store" })
  let body = null
  try { body = await res.json() } catch (e) { body = null }
  if (!res.ok) throw new Error(body?.error ?? `Request failed with status ${res.status}`)
  return body
}

export async function getFacultySchema() {
  const res = await fetch("/api/faculty_schema/faculty", { cache: "no-store" })
  let body = null
  try { body = await res.json() } catch (e) { body = null }
  if (!res.ok) throw new Error(body?.error ?? `Request failed with status ${res.status}`)
  return body
}

export async function searchFacultyByUserName(name: string) {
  const url = `/api/faculty_schema/faculty/search?name=${encodeURIComponent(name)}`
  const res = await fetch(url, { cache: "no-store" })
  let body = null
  try { body = await res.json() } catch (e) { body = null }
  if (!res.ok) throw new Error(body?.error ?? `Request failed with status ${res.status}`)
  return body
}

export async function getFacultyByUserId(userId: string) {
  const url = `/api/faculty_schema/faculty/search?userId=${encodeURIComponent(userId)}`
  const res = await fetch(url, { cache: "no-store" })
  let body = null
  try { body = await res.json() } catch (e) { body = null }
  if (!res.ok) throw new Error(body?.error ?? `Request failed with status ${res.status}`)
  return body
}

export async function getFacultyAvailability(facultyId: string) {
  const url = `/api/faculty_schema/faculty/${encodeURIComponent(facultyId)}/availability`
  const res = await fetch(url, { cache: "no-store" })
  let body = null
  try { body = await res.json() } catch (e) { body = null }
  if (!res.ok) throw new Error(body?.error ?? `Request failed with status ${res.status}`)
  return body
}

export default { getDepartmentsSchema, getCoursesSchema, getFacultySchema, getFacultyAvailability }
