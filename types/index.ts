export interface Note {
  id: string
  title: string
  content: string
  folderId: string | null
  userId: string
  createdAt: string
  updatedAt: string
  folder?: Folder
}

export interface Folder {
  id: string
  name: string
  userId: string
  createdAt: string
  updatedAt: string
  notes?: Note[]
}

