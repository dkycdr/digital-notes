'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FiCalendar as Calendar, FiFileText as FileText } from 'react-icons/fi'
import { toast } from 'sonner'

interface Note {
  id: string
  title: string
  description: string
  subject: string
  fileName: string
  uploadedAt: string
  fileSize: number
}

export default function PDFViewer() {
  const params = useParams()
  const router = useRouter()
  const [note, setNote] = useState<Note | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pdfUrl, setPdfUrl] = useState<string>('')

  useEffect(() => {
    const loadNote = async () => {
      try {
        const response = await fetch(`/api/notes/${params.id}`)
        
        if (response.ok) {
          // Create blob URL for the PDF
          const blob = await response.blob()
          const url = URL.createObjectURL(blob)
          setPdfUrl(url)
          
          // Also get note metadata
          const metadataResponse = await fetch('/api/notes')
          if (metadataResponse.ok) {
            const notes = await metadataResponse.json()
            const currentNote = notes.find((n: Note) => n.id === params.id)
            setNote(currentNote || null)
          }
        } else {
          toast.error('PDF not found')
          router.push('/')
        }
      } catch (error) {
        toast.error('Failed to load PDF')
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      loadNote()
    }

    // Cleanup blob URL on unmount
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [params.id, router, pdfUrl])

  const handleDownload = () => {
    if (note) {
      const link = document.createElement('a')
      link.href = `/api/notes/download/${note.id}`
      link.download = note.fileName
      link.click()
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading PDF...</p>
        </div>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Note not found
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              The requested note could not be found.
            </p>
            <Button onClick={() => router.push('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Notes
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push('/')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <div>
                <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  {note.title}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                  <Badge variant="secondary">{note.subject}</Badge>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(note.uploadedAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    {formatFileSize(note.fileSize)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button 
                variant="outline"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="container mx-auto px-4 py-6">
        <Card className="h-[calc(100vh-200px)]">
          <CardContent className="p-0 h-full">
            {pdfUrl ? (
              <iframe
                src={pdfUrl}
                className="w-full h-full border-0"
                title={note.title}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Eye className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Unable to display PDF
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Please download the file to view it.
                  </p>
                  <Button onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}