"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, File, Loader2, X } from "lucide-react"
import type { Note } from "@/types/note"

interface FileUploadProps {
  onSaveNote: (note: Note) => void
}

export default function FileUpload({ onSaveNote }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [title, setTitle] = useState("")
  const [clientName, setClientName] = useState("")

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check if file is audio
      if (!file.type.startsWith("audio/")) {
        alert("Please select an audio file.")
        return
      }
      setSelectedFile(file)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
  }

  const processFile = async () => {
    if (!selectedFile) {
      alert("Please select an audio file.")
      return
    }

    setIsProcessing(true)

    try {
      const formData = new FormData()
      formData.append("audio", selectedFile)
      formData.append("title", title)
      formData.append("clientName", clientName)

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to process audio")
      }

      const result = await response.json()

      const note: Note = {
        id: Date.now().toString(),
        title: title.trim() || "Untitled Note",
        clientName: clientName.trim() || undefined,
        transcript: result.transcript,
        summary: result.summary,
        followUpItems: result.followUpItems,
        createdAt: new Date().toISOString(),
      }

      onSaveNote(note)

      // Reset form
      setTitle("")
      setClientName("")
      setSelectedFile(null)
    } catch (error) {
      console.error("Error processing file:", error)
      alert("Error processing file. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <Card>
        <CardContent className="pt-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            {!selectedFile ? (
              <div>
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Drag and drop an audio file here, or click to select</p>
                <input type="file" accept="audio/*" onChange={handleFileSelect} className="hidden" id="file-upload" />
                <Button asChild variant="outline">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    Select Audio File
                  </label>
                </Button>
                <p className="text-xs text-gray-500 mt-2">Supports MP3, WAV, M4A, and other audio formats</p>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <File className="h-8 w-8 text-blue-500" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button onClick={removeFile} variant="ghost" size="sm">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Note Details */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="upload-title">Note Title (Optional)</Label>
          <Input
            id="upload-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Client call with John Smith"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="upload-client">Client Name (Optional)</Label>
          <Input
            id="upload-client"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="e.g., John Smith"
            className="mt-1"
          />
        </div>
      </div>

      {/* Process Button */}
      <Button
        onClick={processFile}
        disabled={!selectedFile || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Processing Audio...
          </>
        ) : (
          "Transcribe & Analyze"
        )}
      </Button>
    </div>
  )
}
