import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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

    if (!note.fileData) {
      return NextResponse.json(
        { error: 'PDF file not found' },
        { status: 404 }
      )
    }
    
    return new NextResponse(note.fileData, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${note.fileName}"`,
        'Content-Length': note.fileData.length.toString(),
      },
    })

  } catch (error) {
    console.error('View PDF error:', error)
    return NextResponse.json(
      { error: 'Failed to view PDF' },
      { status: 500 }
    )
  }
}