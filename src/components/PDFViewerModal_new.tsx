'use client'

import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  FiChevronLeft as ChevronLeft, 
  FiChevronRight as ChevronRight, 
  FiZoomIn as ZoomIn, 
  FiZoomOut as ZoomOut, 
  FiDownload as Download, 
  FiMaximize2 as Maximize2, 
  FiRotateCw as RotateCw,
  FiSearch as Search,
  FiX as X,
  FiFileText as FileText,
  FiCalendar as Calendar,
  FiTag as Tag
} from 'react-icons/fi'

interface PDFNote {
  id: string
  title: string
  subject: string
  category: string
  uploadDate: string
  fileName: string
  fileSize: number
}

interface PDFViewerModalProps {
  isOpen: boolean
  onClose: () => void
  pdf: PDFNote | null
}

export function PDFViewerModal({ isOpen, onClose, pdf }: PDFViewerModalProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string>('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && pdf) {
      loadPDF()
    }
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [isOpen, pdf])

  const loadPDF = async () => {
    if (!pdf) return

    setLoading(true)
    try {
      const response = await fetch(`/api/notes/${pdf.id}/view`)
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        setPdfUrl(url)
        
        // For demo purposes, we'll simulate page count
        // In a real implementation, you'd use PDF.js to get actual page count
        setTotalPages(Math.floor(Math.random() * 50) + 10)
      }
    } catch (error) {
      console.error('Error loading PDF:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleZoom = (zoomIn: boolean) => {
    if (zoomIn) {
      setScale(prev => Math.min(prev + 0.25, 3))
    } else {
      setScale(prev => Math.max(prev - 0.25, 0.5))
    }
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const handleDownload = async () => {
    if (!pdf) return

    try {
      const response = await fetch(`/api/notes/${pdf.id}/download`)
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = pdf.fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error downloading PDF:', error)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full h-[90vh] flex flex-col p-0">
        <DialogDescription className="sr-only">
          PDF viewer modal for {pdf?.title}
        </DialogDescription>
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              <div>
                <DialogTitle className="text-xl">{pdf?.title}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">{pdf?.category}</Badge>
                  <span className="text-sm text-muted-foreground">{pdf?.subject}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Toolbar */}
        <div className="px-6 py-3 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Navigation */}
              <div className="flex items-center gap-1 mr-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1 px-2">
                  <Input
                    type="number"
                    value={currentPage}
                    onChange={(e) => handlePageChange(parseInt(e.target.value) || 1)}
                    className="w-16 h-8 text-center"
                    min={1}
                    max={totalPages}
                  />
                  <span className="text-sm text-muted-foreground">/ {totalPages}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 mr-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleZoom(false)}
                  disabled={scale <= 0.5}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm px-2 min-w-[60px] text-center">
                  {Math.round(scale * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleZoom(true)}
                  disabled={scale >= 3}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>

              {/* Rotation */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRotate}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari dalam PDF..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              {searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* PDF Content */}
        <div ref={containerRef} className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Memuat PDF...</p>
              </div>
            </div>
          ) : pdfUrl ? (
            <div className="flex justify-center">
              <div 
                className="bg-white shadow-lg"
                style={{
                  transform: `scale(${scale}) rotate(${rotation}deg)`,
                  transformOrigin: 'center',
                  transition: 'transform 0.2s ease'
                }}
              >
                <iframe
                  src={pdfUrl}
                  className="border-0"
                  style={{
                    width: '800px',
                    height: '600px'
                  }}
                  title={pdf?.title}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <Card className="text-center">
                <CardContent className="p-8">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">PDF tidak dapat dimuat</h3>
                  <p className="text-muted-foreground">
                    Terjadi kesalahan saat memuat PDF. Silakan coba lagi.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Footer Info */}
        {pdf && (
          <div className="px-6 py-3 border-t bg-muted/30">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(pdf.uploadDate)}
                </div>
                <div className="flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  {formatFileSize(pdf.fileSize)}
                </div>
              </div>
              <div>
                Halaman {currentPage} dari {totalPages}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}