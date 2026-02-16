'use client'

interface Detection {
  class: string
  conf: number | null
}

interface PredictionResult {
  detections: Detection[]
  imagedetect: string
}

interface Props {
  result: PredictionResult | null
  loading: boolean
  onReset: () => void
}

export default function DetectionResults({ result, loading, onReset }: Props) {
  // กำลังโหลด
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="relative w-20 h-20">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-kku-gold rounded-full animate-ping"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-kku-maroon rounded-full animate-pulse"></div>
        </div>
        <p className="text-gray-600 font-medium animate-pulse">กำลังประมวลผล...</p>
      </div>
    )
  }

  // ยังไม่มีผลลัพธ์
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <svg className="w-24 h-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-lg font-medium">รอการอัปโหลดรูปภาพ</p>
        <p className="text-sm">ผลการตรวจจับจะแสดงที่นี่</p>
      </div>
    )
  }

  // แสดงผลลัพธ์
  return (
    <div className="space-y-6">
      {/* รูปภาพที่ตรวจจับแล้ว */}
      <div className="relative rounded-lg overflow-hidden shadow-lg bg-gray-100">
        <img
          src={`data:image/jpeg;base64,${result.imagedetect}`}
          alt="Detection Result"
          className="w-full h-auto"
        />
        <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg flex items-center">
          <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
          ตรวจจับสำเร็จ
        </div>
      </div>

      {/* รายการวัตถุที่ตรวจพบ */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-gray-800 flex items-center">
          <svg className="w-5 h-5 mr-2 text-kku-maroon" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          วัตถุที่ตรวจพบ ({result.detections.length})
        </h3>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {result.detections.map((detection, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-kku-gold rounded-full flex items-center justify-center text-gray-900 font-bold text-sm">
                  {index + 1}
                </div>
                <span className="font-semibold text-gray-800 capitalize">
                  {detection.class}
                </span>
              </div>
              
              {detection.conf !== null && (
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${detection.conf * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-green-600 min-w-[60px]">
                    {(detection.conf * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ปุ่มตรวจจับใหม่ */}
      <button onClick={onReset} className="w-full btn-secondary flex items-center justify-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        ตรวจจับใหม่
      </button>
    </div>
  )
}