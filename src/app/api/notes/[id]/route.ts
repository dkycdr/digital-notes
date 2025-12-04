import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const note = await db.note.findUnique({
      where: { id: params.id }, // id kamu String (cuid)
    })

    if (!note) {
      // kalau sudah kehapus, tetap balikin sukses biar frontend nggak error
      return NextResponse.json(
        { message: 'PDF already deleted or not found' },
        { status: 200 }
      )
    }

    await db.note.delete({
      where: { id: params.id },
    })

    return NextResponse.json(
      { message: 'PDF deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting PDF:', error)
    return NextResponse.json(
      { error: 'Failed to delete PDF' },
      { status: 500 }
    )
  }
}