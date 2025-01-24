export function formatDate(date: Date): string {
  return date.toISOString()
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}
