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

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

const API_URL = 'http://127.0.0.1:2569'

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
    // ตรวจสอบประเภทไฟล์
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      onError('กรุณาอัปโหลดไฟล์ภาพประเภท PNG, JPG หรือ JPEG เท่านั้น')
      return
    }

    // ตรวจสอบขนาดไฟล์ (สูงสุด 10MB)
    if (file.size > 10 * 1024 * 1024) {
      onError('ไฟล์ภาพมีขนาดใหญ่เกินไป (สูงสุด 10MB)')
      return
    }

    setSelectedFile(file)
    
    // สร้าง Preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // ส่งไฟล์ไปยัง Backend API
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
          },
          timeout: 30000, // 30 วินาที
        }
      )

      onPrediction(response.data)
    } catch (error: any) {
      // จัดการ Error ตามประเภท
      if (error.code === 'ERR_NETWORK') {
        onError('ไม่สามารถเชื่อมต่อกับ Backend API ได้ กรุณาตรวจสอบว่า Flask server ทำงานอยู่')
      } else if (error.response) {
        onError(`เกิดข้อผิดพลาดจาก Server: ${error.response.status}`)
      } else if (error.request) {
        onError('ส่งคำขอไปยัง Server แต่ไม่ได้รับการตอบกลับ (อาจเป็น CORS Error)')
      } else {
        onError(`เกิดข้อผิดพลาด: ${error.message}`)
      }
      console.error('Upload error:', error)
    } finally {
      onLoadingChange(false)
    }
  }

  // ล้างไฟล์ที่เลือก
  const handleReset = () => {
    setPreview(null)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        className={`upload-zone ${dragActive ? 'upload-zone-active' : ''}`}
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
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-gray-600">
              <p className="text-lg font-semibold">คลิกเพื่อเลือกรูปภาพ</p>
              <p className="text-sm">หรือลากไฟล์มาวางที่นี่</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, JPEG (สูงสุด 10MB)</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleUpload}
          disabled={!selectedFile}
          className="btn-primary flex-1"
        >
          <span className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ตรวจจับวัตถุ
          </span>
        </button>
        
        {preview && (
          <button onClick={handleReset} className="btn-secondary">
            ล้าง
          </button>
        )}
      </div>
    </div>
  )
}