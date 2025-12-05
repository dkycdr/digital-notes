'use client'

import { useState, useCallback } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  FiUpload as Upload, 
  FiFileText as FileText,
  FiCheckCircle as CheckCircle,
  FiAlertCircle as AlertCircle
} from 'react-icons/fi'

interface PDFUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function PDFUploadModal({ isOpen, onClose, onSuccess }: PDFUploadModalProps) {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    category: '',
    description: ''
  })

 const categories = [
  'all',
  'Matematika',
  'Komputer',
  'Ekonomi',
  'Lainnya'
]

const subjects = [
  'all',
  'Probability & Statistics',
  'Programming Concepts',
  'Discrete Math',
  'Calculus',
  'Web Programming',
  'Computer Network',
  'Economic Survival'
]

// mapping subject -> kategori
const subjectCategoryMap: Record<string, string> = {
  'Probability & Statistics': 'Matematika',
  'Discrete Math': 'Matematika',
  'Calculus': 'Matematika',
  'Programming Concepts': 'Komputer',
  'Web Programming': 'Komputer',
  'Computer Network': 'Komputer',
  'Economic Survival': 'Ekonomi'
}
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile)
        setUploadStatus('idle')
      } else {
        alert('Hanya file PDF yang diperbolehkan')
      }
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile)
        setUploadStatus('idle')
      } else {
        alert('Hanya file PDF yang diperbolehkan')
      }
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      alert('Pilih file PDF terlebih dahulu')
      return
    }

    if (!formData.title || !formData.subject || !formData.category) {
      alert('Lengkapi semua field yang wajib diisi')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    const uploadFormData = new FormData()
    uploadFormData.append('file', file)
    uploadFormData.append('title', formData.title)
    uploadFormData.append('subject', formData.subject)
    uploadFormData.append('category', formData.category)
    uploadFormData.append('description', formData.description)

    try {
      const xhr = new XMLHttpRequest()
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100
          setUploadProgress(progress)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          setUploadStatus('success')
          setTimeout(() => {
            onSuccess()
            resetForm()
          }, 1500)
        } else {
          console.error('Upload failed with status:', xhr.status, xhr.responseText)
          setUploadStatus('error')
          // Show detailed error message
          try {
            const errorResponse = JSON.parse(xhr.responseText)
            alert(`Upload gagal: ${errorResponse.error}${errorResponse.details ? ` - ${errorResponse.details}` : ''}`)
          } catch {
            alert(`Upload gagal dengan status ${xhr.status}`)
          }
        }
        setUploading(false)
      })

      xhr.addEventListener('error', (error) => {
        console.error('Upload network error:', error)
        setUploadStatus('error')
        alert('Upload gagal: Terjadi kesalahan jaringan')
        setUploading(false)
      })

      xhr.open('POST', '/api/notes/upload')
      xhr.send(uploadFormData)

    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus('error')
      setUploading(false)
    }
  }

  const resetForm = () => {
    setFile(null)
    setFormData({
      title: '',
      subject: '',
      category: '',
      description: ''
    })
    setUploadProgress(0)
    setUploadStatus('idle')
    onClose()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-sky-500/30 backdrop-blur-xl bg-gradient-to-br from-slate-900 via-sky-900 to-slate-900">
        <DialogDescription className="sr-only">
          Upload PDF modal for adding documents to your collection
        </DialogDescription>
        <DialogHeader className="bg-gradient-to-r from-sky-600/20 to-blue-600/20 -mx-6 px-6 py-4 border-b border-sky-500/30">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-sky-200 to-cyan-200 bg-clip-text text-transparent">
            📚 Tambah PDF ke Koleksi
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 px-2">
          {/* File Upload Area */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-sky-300">File PDF untuk Koleksi</label>
            <div 
              className={`relative group p-8 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
                dragActive 
                  ? 'border-sky-400 bg-sky-500/10' 
                  : 'border-sky-500/30 hover:border-sky-400 bg-sky-500/5'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
              />
              
              {file ? (
                <div className="space-y-3 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-sky-600 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <p className="font-semibold text-white text-lg">{file.name}</p>
                  <p className="text-sm text-sky-300/80">
                    {formatFileSize(file.size)}
                  </p>
                  {!uploading && (
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setFile(null)
                        setUploadStatus('idle')
                      }}
                      className="mt-2 text-sm text-sky-400 hover:text-sky-300 transition-colors"
                    >
                      Ubah File
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-sky-600/50 to-blue-600/50 flex items-center justify-center group-hover:from-sky-500 group-hover:to-blue-500 transition-all duration-300">
                    <Upload className="h-8 w-8 text-sky-200" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Drag and drop PDF di sini</p>
                    <p className="text-sm text-sky-300/80">atau klik untuk memilih file</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-sky-300">Judul Materi *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Masukkan judul pelajaran"
                disabled={uploading}
                required
                className="w-full px-4 py-3 rounded-lg border border-sky-500/30 backdrop-blur-sm bg-sky-500/5 hover:bg-sky-500/10 text-white placeholder-sky-300/50 focus:border-sky-400 focus:outline-none transition-all duration-300"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-sky-300">Mata Kuliah *</label>
              <select 
                value={formData.subject} 
                onChange={(e) => handleInputChange('subject', e.target.value)}
                disabled={uploading}
                required
                className="w-full px-4 py-3 rounded-lg border border-sky-500/30 backdrop-blur-sm bg-sky-500/5 hover:bg-sky-500/10 text-white placeholder-sky-300/50 focus:border-sky-400 focus:outline-none transition-all duration-300"
              >
                <option value="" className="bg-slate-900">Pilih mata kuliah</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject} className="bg-slate-900">
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-sky-300">Kategori *</label>
              <select 
                value={formData.category} 
                onChange={(e) => handleInputChange('category', e.target.value)}
                disabled={uploading}
                required
                className="w-full px-4 py-3 rounded-lg border border-sky-500/30 backdrop-blur-sm bg-sky-500/5 hover:bg-sky-500/10 text-white placeholder-sky-300/50 focus:border-sky-400 focus:outline-none transition-all duration-300"
              >
                <option value="" className="bg-slate-900">Pilih kategori</option>
                {categories.map(category => (
                  <option key={category} value={category} className="bg-slate-900">
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-sky-300">Catatan Pribadi (Opsional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Tambahkan catatan pribadi tentang pelajaran ini..."
                disabled={uploading}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-sky-500/30 backdrop-blur-sm bg-sky-500/5 hover:bg-sky-500/10 text-white placeholder-sky-300/50 focus:border-sky-400 focus:outline-none transition-all duration-300 resize-none"
              />
            </div>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-3 p-4 rounded-lg bg-sky-500/10 border border-sky-500/30">
              <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-sky-300">Upload Progress</label>
                  <span className="text-sm font-semibold text-sky-300">
                  {Math.round(uploadProgress)}%
                </span>
              </div>
                <div className="w-full h-2 rounded-full bg-sky-500/20 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-sky-600 to-cyan-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-sky-300/80 text-center">
                  Sedang mengupload PDF ke koleksi...
                </p>
            </div>
          )}

          {/* Upload Status */}
          {uploadStatus === 'success' && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
              <div>
                <p className="text-green-300 font-semibold">
                  🎉 PDF berhasil ditambahkan ke koleksi!
                </p>
                <p className="text-green-300/70 text-sm">
                  Materi pembelajaran sudah tersimpan dengan aman.
                </p>
              </div>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0" />
              <div>
                <p className="text-red-300 font-semibold">
                  ❌ Upload gagal!
                </p>
                <p className="text-red-300/70 text-sm">
                  Silakan coba lagi atau periksa koneksi internet.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-sky-500/30">
            <button 
              type="button" 
              onClick={resetForm}
              disabled={uploading}
              className="px-6 py-3 rounded-lg border border-sky-500/30 text-sky-300 hover:bg-sky-500/10 transition-all duration-300 disabled:opacity-50 font-medium"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={!file || uploading || uploadStatus === 'success'}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-blue-500 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              {uploading ? '⏳ Mengupload...' : '📚 Tambah ke Koleksi'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}