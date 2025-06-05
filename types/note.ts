export interface Note {
  id: string
  title?: string
  clientName?: string
  transcript: string
  summary: string
  followUpItems: string[]
  createdAt: string
  audioUrl?: string
}
