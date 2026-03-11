// Client-side export request builder.
// Sends island image data to the export API (Lambda) and returns signed S3 URLs.

export interface ExportRequest {
  garmentId: string
  /** Base64 PNG data URLs keyed by UV island ID */
  islandImages: Record<string, string>
  /** Metadata for the sewing spec sheet */
  meta: {
    designName: string
    createdAt: string
  }
}

export interface ExportResult {
  /** Signed S3 URL for the DXF pattern file */
  dxfUrl: string
  /** Signed S3 URLs for each print image, keyed by island ID */
  printUrls: Record<string, string>
  /** Signed S3 URL for the PDF sewing specification sheet */
  specPdfUrl: string
}

export async function requestExport(payload: ExportRequest): Promise<ExportResult> {
  const apiUrl = process.env.NEXT_PUBLIC_EXPORT_API_URL
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_EXPORT_API_URL is not configured')
  }

  const res = await fetch(`${apiUrl}/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Export API error ${res.status}: ${text}`)
  }

  return res.json() as Promise<ExportResult>
}
