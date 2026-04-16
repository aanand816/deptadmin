export async function getDepartments() {
  const res = await fetch("/api/course_schema/departments", { cache: "no-store" })
  let body = null
  try { body = await res.json() } catch (e) { body = null }
  if (!res.ok) {
    const errMsg = body?.error ?? `Request failed with status ${res.status}`
    throw new Error(errMsg)
  }
  return body
}

export async function getCourses() {
  const res = await fetch("/api/course_schema/courses", { cache: "no-store" })
  let body = null
  try { body = await res.json() } catch (e) { body = null }
  if (!res.ok) {
    const errMsg = body?.error ?? `Request failed with status ${res.status}`
    throw new Error(errMsg)
  }
  return body
}

export async function getPrograms() {
  const res = await fetch("/api/course_schema/programs", { cache: "no-store" })
  let body = null
  try { body = await res.json() } catch (e) { body = null }
  if (!res.ok) throw new Error(body?.error ?? `Request failed with status ${res.status}`)
  return body
}

export async function getProgramSemesters() {
  const res = await fetch("/api/course_schema/program_semesters", { cache: "no-store" })
  let body = null
  try { body = await res.json() } catch (e) { body = null }
  if (!res.ok) throw new Error(body?.error ?? `Request failed with status ${res.status}`)
  return body
}

export async function getElectiveGroups() {
  const res = await fetch("/api/course_schema/elective_groups", { cache: "no-store" })
  let body = null
  try { body = await res.json() } catch (e) { body = null }
  if (!res.ok) throw new Error(body?.error ?? `Request failed with status ${res.status}`)
  return body
}

export async function getSemesters() {
  const res = await fetch("/api/course_schema/semesters", { cache: "no-store" })
  let body = null
  try { body = await res.json() } catch (e) { body = null }
  if (!res.ok) throw new Error(body?.error ?? `Request failed with status ${res.status}`)
  return body
}

export async function getTerms() {
  const res = await fetch("/api/course_schema/terms", { cache: "no-store" })
  let body = null
  try { body = await res.json() } catch (e) { body = null }
  if (!res.ok) throw new Error(body?.error ?? `Request failed with status ${res.status}`)
  return body
}

export async function getProgramsUsers() {
  const res = await fetch("/api/course_schema/programs_users", { cache: "no-store" })
  let body = null
  try { body = await res.json() } catch (e) { body = null }
  if (!res.ok) throw new Error(body?.error ?? `Request failed with status ${res.status}`)
  return body
}

export default { getDepartments, getCourses }
