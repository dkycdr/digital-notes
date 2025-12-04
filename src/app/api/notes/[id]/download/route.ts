import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const note = await db.note.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    const filePath = join(process.cwd(), 'uploads', note.filePath)
    
    try {
      const fileBuffer = await readFile(filePath)
      
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${note.fileName}"`,
          'Cache-Control': 'public, max-age=3600',
        },
      })
    } catch (fileError) {
      console.error('File not found:', fileError)
      return NextResponse.json(
        { error: 'File not found on disk' },
        { status: 404 }
      )
    }

  } catch (error) {
    console.error('Error downloading note:', error)
    return NextResponse.json(
      { error: 'Failed to download note' },
      { status: 500 }
    )
  }
}