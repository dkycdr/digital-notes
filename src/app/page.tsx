'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FiSearch as Search, FiUpload as Upload, FiBook as BookOpen, FiFileText as FileText, FiCalendar as Calendar, FiFilter as Filter } from 'react-icons/fi'
import { PDFUploadModal } from '@/components/PDFUploadModal'
import { PDFViewerModal } from '@/components/PDFViewerModal'
import { ThemeToggle } from '@/components/theme-toggle'

interface PDFNote {
  id: string
  title: string
  subject: string
  category: string
  uploadDate: string
  fileName: string
  fileSize: number
}

export default function DigitalNotes() {
  const [notes, setNotes] = useState<PDFNote[]>([])
  const [filteredNotes, setFilteredNotes] = useState<PDFNote[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [selectedPDF, setSelectedPDF] = useState<PDFNote | null>(null)
  const [isViewerModalOpen, setIsViewerModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    fetchNotes()
  }, [])

  useEffect(() => {
    filterNotes()
  }, [notes, searchQuery, selectedCategory, selectedSubject])

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes')
      if (response.ok) {
        const data = await response.json()
        setNotes(data)
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterNotes = () => {
    let filtered = notes

    if (searchQuery) {
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.subject.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(note => note.category === selectedCategory)
    }

    if (selectedSubject !== 'all') {
      filtered = filtered.filter(note => note.subject === selectedSubject)
    }

    setFilteredNotes(filtered)
  }

  const handleUploadSuccess = () => {
    fetchNotes()
    setIsUploadModalOpen(false)
  }

  const handleViewPDF = (note: PDFNote) => {
    setSelectedPDF(note)
    setIsViewerModalOpen(true)
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

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-sky-950 to-slate-950"></div>
        {/* Animated Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="mb-8 p-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:border-white/40 transition-all duration-500">
          <div className="flex items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                ✨ Selamat Datang Kembali, Students!
              </h2>
              <p className="text-white/70 text-lg">
                "Knowledge is power, but sharing knowledge is superpower."
              </p>
            </div>
            <div className="text-5xl animate-bounce flex-shrink-0">📚</div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8 gap-8">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-sky-600 to-cyan-600 rounded-xl shadow-xl">
                <BookOpen className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white aesthetic-glow">
                  Dwiky's Digital Notes
                </h1>
                <p className="text-white/70 text-lg mt-1">Koleksi Pribadi PDF Pelajaran Kuliah 🎓</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <ThemeToggle />
              <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="px-6 py-3 font-semibold text-white bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-cyan-500 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Tambah PDF
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
              <input
                placeholder="Cari judul atau mata kuliah..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/40 focus:border-white/50 focus:outline-none focus:bg-white/15 transition-all"
              />
            </div>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white focus:border-white/50 focus:outline-none focus:bg-white/15 transition-all"
            >
              {categories.map(category => (
                <option key={category} value={category} className="bg-slate-900 text-white">
                  {category === 'all' ? 'Semua Kategori' : category}
                </option>
              ))}
            </select>
            <select 
              value={selectedSubject} 
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white focus:border-white/50 focus:outline-none focus:bg-white/15 transition-all"
            >
              {subjects.map(subject => (
                <option key={subject} value={subject} className="bg-slate-900 text-white">
                  {subject === 'all' ? 'Semua Mata Kuliah' : subject}
                </option>
              ))}
            </select>
            <button 
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
                setSelectedSubject('all')
              }}
              className="px-4 py-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all flex items-center justify-center gap-2 font-medium"
            >
              <Filter className="h-4 w-4" />
              Reset Filter
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="p-6 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70 font-medium mb-2">Total PDF</p>
                <p className="text-3xl font-bold text-white">{notes.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-sky-600 to-sky-400">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="p-6 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70 font-medium mb-2">Kategori</p>
                <p className="text-3xl font-bold text-white">{categories.length - 1}</p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="p-6 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70 font-medium mb-2">Mata Kuliah</p>
                <p className="text-3xl font-bold text-white">{subjects.length - 1}</p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-600 to-cyan-400">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="p-6 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70 font-medium mb-2">Filter Aktif</p>
                <p className="text-3xl font-bold text-white">{filteredNotes.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-orange-600 to-orange-400">
                <Filter className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* PDF Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full animate-spin"></div>
                <div className="absolute inset-2 bg-slate-950 rounded-full"></div>
              </div>
              <p className="text-white/70">Memuat koleksi PDF...</p>
            </div>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="p-12 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-sky-600 to-blue-600 flex items-center justify-center">
              <FileText className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {searchQuery || selectedCategory !== 'all' || selectedSubject !== 'all' 
                ? 'PDF Tidak Ditemukan' 
                : 'Koleksi PDF Masih Kosong!'}
            </h3>
            <p className="text-white/70 text-lg mb-6 max-w-md mx-auto">
              {searchQuery || selectedCategory !== 'all' || selectedSubject !== 'all' 
                ? 'Tidak ada PDF yang cocok dengan filter yang dipilih' 
                : 'Mulai perjalanan belajarmu dengan menambahkan PDF pertama'}
            </p>
            {!searchQuery && selectedCategory === 'all' && selectedSubject === 'all' && (
                <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="px-8 py-3 font-semibold text-white bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-cyan-500 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 mx-auto shadow-lg"
              >
                <Upload className="h-5 w-5" />
                Tambah PDF Pertama
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <div 
                key={note.id}
                className="p-6 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:border-white/40 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white line-clamp-2">
                      {note.title}
                    </h3>
                    <p className="text-sm text-white/60 mt-1">{note.subject}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-gradient-to-br from-sky-600 to-blue-600 flex-shrink-0">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-sky-600 to-sky-400 text-white text-xs font-semibold">
                    {note.category}
                  </span>
                  <span className="px-3 py-1 rounded-full border border-white/30 text-white/80 text-xs font-medium">
                    {formatFileSize(note.fileSize)}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-sm text-white/60 mb-4">
                  <Calendar className="h-4 w-4" />
                  {formatDate(note.uploadDate)}
                </div>

                <button 
                  onClick={() => handleViewPDF(note)}
                  className="w-full py-3 font-semibold text-white bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-blue-500 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Buka PDF
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <PDFUploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />

      {/* PDF Viewer Modal */}
      <PDFViewerModal
  isOpen={isViewerModalOpen}
  onClose={() => setIsViewerModalOpen(false)}
  pdf={selectedPDF}
  onDeleted={(deletedPdf) => {
    setNotes((prev) => prev.filter((n) => n.id !== deletedPdf))
  }}
/>
    </div>
  )
}