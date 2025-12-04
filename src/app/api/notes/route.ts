import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const notes = await db.note.findMany({
      orderBy: {
        uploadedAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        subject: true,
        category: true,
        uploadedAt: true,
        fileName: true,
        fileSize: true,
      },
    })

    const formattedNotes = notes.map(note => ({
      id: note.id,
      title: note.title,
      subject: note.subject,
      category: note.category,
      uploadDate: note.uploadedAt,
      fileName: note.fileName,
      fileSize: note.fileSize,
    }))

    return NextResponse.json(formattedNotes)

  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    )
  }
}