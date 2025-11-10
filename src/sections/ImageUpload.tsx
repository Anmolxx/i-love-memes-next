'use client'

import { useCallback, useRef, useState } from 'react'
import { ImagePlus, UploadCloud } from 'lucide-react'

export function ImageUpload() {
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      // Handle selected file here (upload or preview)
    }
  }, [])

  const onDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const f = e.dataTransfer.files?.[0]
    if (f && fileInputRef.current) {
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(f)
      fileInputRef.current.files = dataTransfer.files
      fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }))
    }
  }, [])

  const onDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const triggerFileDialog = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <section
      className="w-full py-16"
      style={{ backgroundColor: '#faf2fc' }}
    >
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-black/10 bg-white shadow-md md:shadow-lg px-4">
        <div className="p-6 md:p-8">
          <div className="mx-auto max-w-xl">
            <div className="text-center">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#D5A6F2] text-[#300458] border border-black/10">
                <ImagePlus className="h-5 w-5" />
              </div>
              <h1 className="mt-3 text-2xl font-semibold text-[#300458]">Image Upload</h1>
              <p className="text-sm text-black/60">Pick a template or upload your own image</p>
            </div>

            <div className="mt-6">
              <label
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                htmlFor="file-input"
                className={`group relative block rounded-xl border-2 border-dashed p-8 text-center transition ${
                  dragActive ? 'border-[#CD01BA] bg-white' : 'border-black/10 bg-[#EAD0F9]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  id="file-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onInputChange}
                />
                <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#300458] border border-black/10">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-base font-medium text-[#300458]">Drag & drop your image here</p>
                    <p className="text-xs text-black/60">or click to browse files</p>
                  </div>
                  <button
                    type="button"
                    onClick={triggerFileDialog}
                    className="mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white shadow-sm"
                    style={{ backgroundImage: 'linear-gradient(90deg,#CD01BA,#E20317)' }}
                  >
                    Choose Image
                  </button>
                </div>
              </label>

              <div className="mt-3 text-center text-xs text-black/60">
                PNG, JPG, WEBP • up to 10MB
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
