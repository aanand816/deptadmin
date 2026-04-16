export async function getSchedulerDepartments() {
  const res = await fetch("/api/scheduler_schema/department", { cache: "no-store" })
  let body = null
  try { body = await res.json() } catch (e) { body = null }
  if (!res.ok) throw new Error(body?.error ?? `Request failed with status ${res.status}`)
  return body
}

export async function getSchedulerCourses() {
  const res = await fetch("/api/scheduler_schema/course", { cache: "no-store" })
  let body = null
  try { body = await res.json() } catch (e) { body = null }
  if (!res.ok) throw new Error(body?.error ?? `Request failed with status ${res.status}`)
  return body
}

export async function getSchedulerTerms() {
  const res = await fetch("/api/scheduler_schema/term", { cache: "no-store" })
  let body = null
  try { body = await res.json() } catch (e) { body = null }
  if (!res.ok) throw new Error(body?.error ?? `Request failed with status ${res.status}`)
  return body
}

export default { getSchedulerDepartments, getSchedulerCourses, getSchedulerTerms }
