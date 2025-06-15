export default function parseDuration(durationStr: string): number {
  const trimmed = durationStr.trim().toLowerCase()

  // Match patterns like "1 hr 30 min", "2 hours", "45 minutes", etc.
  const hourMatch = trimmed.match(/(\d+)\s*(hr|hour|hours)/)
  const minuteMatch = trimmed.match(/(\d+)\s*(min|minute|minutes)/)

  let totalSeconds = 0

  if (hourMatch) {
    totalSeconds += Number.parseInt(hourMatch[1]) * 3600
  }

  if (minuteMatch) {
    totalSeconds += Number.parseInt(minuteMatch[1]) * 60
  }

  // If no valid time found, throw error
  if (totalSeconds === 0) {
    throw new Error(`Invalid duration format: ${durationStr}`)
  }

  return totalSeconds
}
