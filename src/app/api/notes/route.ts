import { NextResponse } from 'next/server'
import { getAllFolders } from '@/lib/notes'
import { apiHandler } from '../_utils/api-handler'

export const GET = apiHandler({ methods: ['GET'] }, async () => {
  const folders = await getAllFolders()
  return NextResponse.json(folders)
})
