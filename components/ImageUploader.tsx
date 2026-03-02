'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import axios from 'axios'

interface Detection {
  class: string
  conf: number | null
}

interface PredictionResult {
  detections: Detection[]
  imagedetect: string
}

interface Props {
  onPrediction: (result: PredictionResult) => void
  onError: (error: string) => void
  onLoadingChange: (loading: boolean) => void
}

// ✅ ประกาศ URL ไว้ข้างนอก โดยดึงจาก Environment Variable ใน Vercel
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:2569";

export default function ImageUploader({ onPrediction, onError, onLoadingChange }: Props) {
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // จัดการ Drag Enter, Drag Over
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  // จัดการเมื่อ Drop ไฟล์
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  // จัดการเมื่อเลือกไฟล์ผ่าน Input
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  // ตรวจสอบและแสดง Preview รูปภาพ
  const handleFile = (file: File) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      onError('กรุณาอัปโหลดไฟล์ภาพประเภท PNG, JPG หรือ JPEG เท่านั้น')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      onError('ไฟล์ภาพมีขนาดใหญ่เกินไป (สูงสุด 10MB)')
      return
    }

    setSelectedFile(file)
    
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // ✅ ส่งไฟล์ไปยัง Backend API (รวม Logic ไว้ในนี้)
  const handleUpload = async () => {
    if (!selectedFile) {
      onError('กรุณาเลือกไฟล์ภาพก่อน')
      return
    }

    const formData = new FormData()
    formData.append('file', selectedFile)

    onLoadingChange(true)
    onError('')

    try {
      const response = await axios.post<PredictionResult>(
        `${API_URL}/predict`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            // 🔥 สำคัญ: ใส่ Header นี้เพื่อข้ามหน้า Warning ของ ngrok
            'ngrok-skip-browser-warning': 'true', 
          },
          timeout: 60000, // เพิ่มเวลาเป็น 60 วินาทีสำหรับรูปขนาดใหญ่
        }
      )

      onPrediction(response.data)
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK') {
        onError('ไม่สามารถเชื่อมต่อกับ Backend ได้ (เช็ค ngrok หรือ CORS)')
      } else if (error.response) {
        onError(`Error จาก Server: ${error.response.status}`)
      } else {
        onError(`เกิดข้อผิดพลาด: ${error.message}`)
      }
      console.error('Upload error:', error)
    } finally {
      onLoadingChange(false)
    }
  }

  const handleReset = () => {
    setPreview(null)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <div
        className={`upload-zone ${dragActive ? 'upload-zone-active' : ''} border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${preview ? 'border-kku-maroon bg-red-50' : 'border-gray-300 hover:border-kku-maroon'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/png,image/jpeg,image/jpg"
          onChange={handleChange}
        />
        
        {preview ? (
          <div className="space-y-4">
            <img 
              src={preview} 
              alt="Preview" 
              className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
            />
            <p className="text-sm text-gray-600 font-medium">{selectedFile?.name}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-gray-600">
              <p className="text-lg font-semibold">คลิกเพื่อเลือกรูปภาพ</p>
              <p className="text-sm">หรือลากไฟล์มาวางที่นี่</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, JPEG (สูงสุด 10MB)</p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleUpload}
          disabled={!selectedFile}
          className="bg-kku-maroon hover:bg-red-800 text-white font-bold py-3 px-6 rounded-lg flex-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ตรวจจับวัตถุ
        </button>
        
        {preview && (
          <button 
            onClick={handleReset} 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition-colors"
          >
            ล้าง
          </button>
        )}
      </div>
    </div>
  )
}
