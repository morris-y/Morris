import { getAllFolders } from '@/lib/notes'
import { NotesLayout } from '@/components/notes/notes-layout'

export const metadata = {
  title: 'Notes — Morris Yang',
}

export default async function NotesPage() {
  const folders = await getAllFolders()
  return <NotesLayout folders={folders} />
}
