import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const subject = formData.get('subject') as string
    const category = formData.get('category') as string
    const description = formData.get('description') as string

    console.log('Upload request data:', {
      file: file ? `${file.name} (${file.size} bytes, ${file.type})` : 'null',
      title: title || 'null',
      subject: subject || 'null',
      category: category || 'null',
      description: description || 'null'
    })

    if (!file) {
      console.log('Upload failed: No file provided')
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      )
    }

    if (file.type !== 'application/pdf') {
      console.log('Upload failed: Invalid file type:', file.type)
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      )
    }

    if (!title || !subject || !category) {
      console.log('Upload failed: Missing required fields', { title, subject, category })
      return NextResponse.json(
        { error: 'Title, subject, and category are required' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory already exists
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const fileName = `${timestamp}_${randomString}_${file.name}`
    const filePath = join(uploadsDir, fileName)

    // Save file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Save to database
    const note = await db.note.create({
      data: {
        title,
        description,
        subject,
        category,
        fileName: file.name,
        filePath: fileName, // Store only the filename, not full path
        fileSize: file.size,
      },
    })

    return NextResponse.json({
      success: true,
      note: {
        id: note.id,
        title: note.title,
        subject: note.subject,
        category: note.category,
        uploadDate: note.uploadedAt,
        fileName: note.fileName,
        fileSize: note.fileSize,
      },
    })

  } catch (error) {
    console.error('Upload error details:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { 
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}