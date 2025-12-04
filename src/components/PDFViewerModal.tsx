'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  FiFileText as FileText,
  FiTag as Tag,
  FiCalendar as Calendar,
  FiLoader as Loader2,
  FiMaximize2 as Maximize2,
  FiMinimize2 as Minimize2,
  FiGrid as Grid,
  FiTrash2 as Trash2,
  FiDownload as FileDown,
  FiZoomIn as ZoomIn,
  FiZoomOut as ZoomOut,
  FiRotateCw as RotateCw,
  FiHand as Hand,
  FiMove as MousePointer,
} from 'react-icons/fi'

interface PDFNote {
  id: string
  title: string
  subject: string
  category: string
  uploadDate: string
  fileName: string
  fileSize: number
  // Optional: totalPages from backend (recommended for accurate footer info)
  totalPages?: number
}

interface PDFViewerModalProps {
  isOpen: boolean
  onClose: () => void
  pdf: PDFNote | null
  onDeleted?: (id: string) => void
  onDownloaded?: (id: string) => void
}

export function PDFViewerModal({ isOpen, onClose, pdf, onDeleted, onDownloaded }: PDFViewerModalProps) {
  const viewerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const [loading, setLoading] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string>('')

  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [panMode, setPanMode] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const [showThumbnails, setShowThumbnails] = useState(false)
  const [viewMode, setViewMode] = useState<'single' | 'full'>('single')
  const [isFullscreen, setIsFullscreen] = useState(false)

  const totalPages = pdf?.totalPages ?? 0

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen || !pdf) return
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case '+':
        case '=':
          e.preventDefault()
          setScale(prev => Math.min(3, parseFloat((prev + 0.1).toFixed(2))))
          break
        case '-':
        case '_':
          e.preventDefault()
          setScale(prev => Math.max(0.5, parseFloat((prev - 0.1).toFixed(2))))
          break
        case 'r':
        case 'R':
          e.preventDefault()
          setRotation(prev => (prev + 90) % 360)
          break
        case 'p':
        case 'P':
          e.preventDefault()
          setPanMode(prev => !prev)
          break
        case 'f':
        case 'F':
          e.preventDefault()
          toggleFullscreen()
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
        default:
          break
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, pdf, onClose])

  // Fullscreen change tracking
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  const toggleFullscreen = () => {
    const el = viewerRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  // Load PDF
  useEffect(() => {
    let revokedUrl = ''
    const load = async () => {
      if (!isOpen || !pdf) return
      setLoading(true)
      try {
        const res = await fetch(`/api/notes/${pdf.id}/view`)
        if (!res.ok) throw new Error('Failed to fetch PDF')
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        setPdfUrl(url)
        revokedUrl = url
      } catch (err) {
        console.error('Error loading PDF:', err)
        setPdfUrl('')
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => {
      if (revokedUrl) URL.revokeObjectURL(revokedUrl)
      setPdfUrl('')
    }
  }, [isOpen, pdf])

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!panMode) return
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !panMode) return
    e.preventDefault()
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => setIsDragging(false)

  // Actions
  const handleDeletePDF = useCallback(async () => {
    if (!pdf) return
    const ok = confirm(`Apakah Anda yakin ingin menghapus PDF "${pdf.title}"?`)
    if (!ok) return
    try {
      const response = await fetch(`/api/notes/${pdf.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete')
      onDeleted?.(pdf.id)
      onClose()
    } catch (error) {
      console.error('Error deleting PDF:', error)
      alert('Gagal menghapus PDF. Silakan coba lagi.')
    }
  }, [pdf, onClose, onDeleted])

  const handleDownload = useCallback(async () => {
    if (!pdf) return
    try {
      const response = await fetch(`/api/notes/${pdf.id}/download`)
      if (!response.ok) throw new Error('Failed to download')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = pdf.fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      onDownloaded?.(pdf.id)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Gagal mengunduh PDF.')
    }
  }, [pdf, onDownloaded])

  // Helpers
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[90vw] w-full h-[90vh] flex flex-col p-0 m-0">
        <DialogDescription className="sr-only">
          PDF viewer modal for {pdf?.title}
        </DialogDescription>
        {/* Header */}
        <DialogHeader className="px-4 md:px-6 py-3 md:py-4 border-b bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/20 dark:to-blue-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-1 md:p-2 bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900/30 dark:to-blue-900/30 rounded-lg">
                <FileText className="h-4 w-4 md:h-5 md:w-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-lg md:text-xl text-sky-800 dark:text-sky-200 truncate">{pdf?.title}</DialogTitle>
                <div className="flex items-center gap-1 md:gap-2 mt-1">
                  <Badge variant="secondary" className="bg-sky-100 text-sky-800 dark:bg-sky-800/30 dark:text-sky-200 text-xs md:text-sm">
                    {pdf?.category}
                  </Badge>
                  <span className="text-xs md:text-sm text-muted-foreground truncate">{pdf?.subject}</span>
                </div>
              </div>
            </div>
              <div className="flex items-center gap-1 md:gap-2">
              <Button variant="outline" size="sm" onClick={handleDeletePDF} title="Hapus PDF" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload} title="Unduh PDF">
                <FileDown className="h-4 w-4" />
              </Button>
              {viewMode === 'single' ? (
                <Button variant="outline" size="sm" onClick={toggleFullscreen} title="Fullscreen">
                  <Maximize2 className="h-4 w-4" />
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setViewMode('single')} title="Keluar Full View">
                  <Minimize2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Main */}
        <div className="flex-1 flex overflow-hidden">
          {/* Thumbnails (placeholder) */}
          {showThumbnails && (
            <div className="w-32 md:w-48 bg-gray-50 dark:bg-gray-900 border-r overflow-y-auto p-1 md:p-2">
              <h3 className="text-xs md:text-sm font-semibold mb-1 md:mb-2 text-sky-800 dark:text-sky-200">Halaman</h3>
              <div className="space-y-1 md:space-y-2">
                {(totalPages ? Array.from({ length: Math.min(totalPages, 10) }) : Array.from({ length: 5 })).map((_, i) => (
                  <div
                    key={i}
                    className="cursor-pointer rounded border border-gray-300 hover:border-sky-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  >
                    <div className="p-1 md:p-2 bg-white dark:bg-gray-800 rounded">
                      <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded flex items-center justify-center">
                        <span className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300">{i + 1}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Viewer */}
          <div
            ref={viewerRef}
            className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-0 m-0"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: panMode ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
          >
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 md:h-12 md:w-12 animate-spin text-sky-600 mx-auto mb-2 md:mb-4" />
                  <p className="text-xs md:text-sm text-sky-600 dark:text-sky-400">Memuat PDF...</p>
                </div>
              </div>
            ) : pdfUrl ? (
              <div className="flex justify-center items-center min-h-full">
                <div
                  className="bg-white dark:bg-gray-800 shadow-2xl rounded-lg overflow-hidden"
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
                    transformOrigin: 'center',
                    transition: isDragging ? 'none' : 'transform 0.2s ease',
                    cursor: panMode ? (isDragging ? 'grabbing' : 'grab') : 'default',
                  }}
                >
                  <iframe
                    ref={iframeRef}
                    src={pdfUrl}
                    className="border-0 block"
                    style={{
                      width: '100vw',
                      height: '100vh',
                    }}
                    title={pdf?.title}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <Card className="text-center border-sky-200 dark:border-sky-700">
                  <CardContent className="p-4 md:p-8">
                    <FileText className="h-8 w-8 md:h-16 md:w-16 mx-auto text-sky-500 mb-2 md:mb-4" />
                    <h3 className="text-sm md:text-lg font-semibold mb-1 md:mb-2 text-sky-800 dark:text-sky-200">PDF tidak dapat dimuat</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">Terjadi kesalahan saat memuat PDF. Silakan coba lagi.</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Full view controls */}
          {viewMode === 'full' && (
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('single')}
                title="Keluar Full View"
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Toolbar */}
          {viewMode !== 'full' && (
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-2">
              <div className="flex items-center justify-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setViewMode('full')} title="Full View">
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowThumbnails(s => !s)} title="Tampilkan Thumbnail">
                  <Grid className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setScale(s => Math.min(3, parseFloat((s + 0.1).toFixed(2))))} title="Zoom In">
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setScale(s => Math.max(0.5, parseFloat((s - 0.1).toFixed(2))))} title="Zoom Out">
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setRotation(r => (r + 90) % 360)} title="Rotasi">
                  <RotateCw className="h-4 w-4" />
                </Button>
                <Button
                  variant={panMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPanMode(p => !p)}
                  title={panMode ? 'Matikan Pan' : 'Aktifkan Pan'}
                >
                  {panMode ? <Hand className="h-4 w-4" /> : <MousePointer className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  title="Download PDF"
                >
                  <FileDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeletePDF}
                  title="Delete PDF"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {pdf && (
          <div className="px-2 md:px-6 py-2 md:py-3 border-t bg-muted/30">
            <div className="flex items-center justify-between text-xs md:text-sm text-muted-foreground">
              <div className="flex items-center gap-2 md:gap-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden md:inline">{formatDate(pdf.uploadDate)}</span>
                  <span className="md:hidden">
                    {new Date(pdf.uploadDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Tag className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden md:inline">{formatFileSize(pdf.fileSize)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-4">
                {totalPages > 0 && <span className="hidden md:inline">Total halaman {totalPages}</span>}
                <span className="hidden md:inline">Zoom {Math.round(scale * 100)}%</span>
                <span className="hidden md:inline">Rotasi {rotation}°</span>
                <span className="hidden md:inline">{panMode ? 'Pan Mode' : 'Select Mode'}</span>
                <span className="hidden md:inline">{isFullscreen ? 'Fullscreen' : 'Windowed'}</span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}