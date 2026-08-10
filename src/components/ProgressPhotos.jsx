import GlassBackground from '../design-system/components/GlassBackground'
import { useState, useRef, useEffect } from 'react'
import { Camera, Plus, X, Trash2, ChevronLeft, Calendar, Image } from 'lucide-react'
import useStore from '../store/useStore'
import FeatureGuide from './FeatureGuide'

const compressImage = (file, maxWidth = 800, quality = 0.7) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let w = img.width; let h = img.height
        if (w > maxWidth) { h = h * maxWidth / w; w = maxWidth }
        canvas.width = w; canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

export default function ProgressPhotos() {
  const { progressPhotos, addProgressPhoto, deleteProgressPhoto, pushView } = useStore()
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop())
    }
  }, [stream])

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      setStream(s)
      setShowCamera(true)
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = s
      }, 100)
    } catch (e) {
      fileInputRef.current?.click()
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current; const canvas = canvasRef.current
    canvas.width = video.videoWidth; canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
    addProgressPhoto({ dataUrl, date: selectedDate, note: '' })
    stopCamera()
  }

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(t => t.stop())
    setStream(null)
    setShowCamera(false)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await compressImage(file)
    addProgressPhoto({ dataUrl, date: selectedDate, note: '' })
    e.target.value = ''
  }

  const getPhotosByMonth = () => {
    const grouped = {}
    progressPhotos.forEach((p) => {
      const month = p.date?.slice(0, 7) || 'inconnu'
      if (!grouped[month]) grouped[month] = []
      grouped[month].push(p)
    })
    return Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a))
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => pushView('dashboard')} className="w-10 h-10 rounded-xl bg-dark-card flex items-center justify-center text-white border border-dark-border">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-white">Photos</h2>
      </div>

      <FeatureGuide type="photos" />

      {showCamera ? (
        <div className="fixed inset-0 z-50 bg-black">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-6">
            <button onClick={stopCamera} className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-xl">
              <X size={24} />
            </button>
            <button onClick={capturePhoto} className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-xl">
              <Camera size={32} className="text-dark-bg" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 rounded-xl bg-dark-card border border-dark-border text-white text-sm"
            />
            <div className="flex gap-2">
              <button onClick={startCamera} className="px-4 py-2 rounded-xl bg-lime text-dark-bg font-medium text-sm flex items-center gap-2">
                <Camera size={16} /> Photo
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 rounded-xl bg-dark-card text-white border border-dark-border text-sm flex items-center gap-2">
                <Image size={16} /> Importer
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </div>
          </div>

          {progressPhotos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-white/30 space-y-4">
              <Camera size={48} className="text-white/10" />
              <p className="text-sm">Prends ta première photo de progression</p>
            </div>
          ) : (
            getPhotosByMonth().map(([month, photos]) => (
              <div key={month}>
                <p className="text-sm text-white/50 font-medium mb-2">
                  {new Date(month + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((p) => (
                    <div key={p.id} className="relative group aspect-square rounded-xl overflow-hidden bg-dark-card border border-dark-border">
                      <img src={p.dataUrl} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => deleteProgressPhoto(p.id)}
                        className="absolute top-1 right-1 w-7 h-7 rounded-full bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={12} className="text-white" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                        <p className="text-[10px] text-white/80">
                          {new Date(p.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
