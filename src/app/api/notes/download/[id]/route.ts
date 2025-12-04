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
      where: { id: params.id }
    })

    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    // Read the PDF file
    const filePath = join(process.cwd(), 'uploads', note.filePath.split('/').pop() || '')
    
    try {
      const fileBuffer = await readFile(filePath)
      
      // Return the PDF file for download
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${note.fileName}"`,
          'Content-Length': fileBuffer.length.toString(),
        },
      })
    } catch (fileError) {
      console.error('File read error:', fileError)
      return NextResponse.json(
        { error: 'PDF file not found on server' },
        { status: 404 }
      )
    }

  } catch (error) {
    console.error('Download PDF error:', error)
    return NextResponse.json(
      { error: 'Failed to download PDF' },
      { status: 500 }
    )
  }
}