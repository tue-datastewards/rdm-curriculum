export function toCsv(rows: Array<Array<string | number>>): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const value = String(cell ?? '')
          return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
        })
        .join(','),
    )
    .join('\r\n')
}

export function downloadText(filename: string, content: string, type: string): void {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
