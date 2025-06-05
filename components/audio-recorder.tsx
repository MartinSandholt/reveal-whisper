"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, Play, Pause } from "lucide-react"
import type { Note } from "@/types/note"

interface AudioRecorderProps {
  onSaveNote: (note: Note) => void
}

export default function AudioRecorder({ onSaveNote }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  //const [setIsProcessing] = useState(false)
  const [title, setTitle] = useState("")
  const [clientName, setClientName] = useState("")

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/wav" })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach((track) => track.stop())
        setTimeout(() => {
          if (blob.size > 0) {
            processAudio(blob)
          }
        }, 0)
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error starting recording:", error)
      alert("Error accessing microphone. Please check permissions.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const processAudio = async (blobArg?: Blob) => {
    const blobToUse = blobArg || audioBlob;
    if (!blobToUse) {
      alert("Please record audio first.")
      return
    }

    //setIsProcessing(true)

    try {
      const formData = new FormData()
      formData.append("audio", blobToUse, "recording.wav")
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

      // Generate title from topic if not provided
      let generatedTitle = title.trim()
      if (!generatedTitle) {
        if (result.topic && typeof result.topic === 'string') {
          generatedTitle = result.topic.slice(0, 50) || 'Untitled Note'
        } else if (result.summary && typeof result.summary === 'string') {
          const firstSentence = result.summary.split(/[.!?]/)[0].trim()
          generatedTitle = firstSentence.slice(0, 50) || 'Untitled Note'
        } else {
          generatedTitle = 'Untitled Note'
        }
      }

      const note: Note = {
        id: Date.now().toString(),
        title: generatedTitle,
        clientName: clientName.trim() || undefined,
        transcript: result.transcript,
        summary: result.summary,
        followUpItems: result.followUpItems,
        createdAt: new Date().toISOString(),
        audioUrl: audioUrl || undefined,
      }

      onSaveNote(note)

      // Reset form
      setTitle("")
      setClientName("")
      setAudioBlob(null)
      setAudioUrl(null)
      setIsPlaying(false)
    } catch (error) {
      console.error("Error processing audio:", error)
      alert("Error processing audio. Please try again.")
    } finally {
      //setIsProcessing(false)
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-50 border-t border-slate-200 p-4 space-y-6">
      {/* Recording Controls */}
      <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-4">
              {!isRecording ? (
                <Button onClick={startRecording} size="lg" className="bg-red-500 hover:bg-red-600 text-white">
                  <Mic className="h-5 w-5 mr-2" />
                  Start Recording
                </Button>
              ) : (
                <Button onClick={stopRecording} size="lg" className="bg-white hover:bg-slate-50 text-slate-600">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Recording...</span>
                </Button>
              )}
            </div>
{/*
            {isRecording && (
              <div className="flex items-center space-x-2 text-red-500">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Recording...</span>
              </div>
            
            )}*/}
          </div>

      {/* Audio Playback */}
      {audioUrl && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Recorded Audio</span>
              <Button onClick={togglePlayback} variant="outline" size="sm">
                {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {isPlaying ? "Pause" : "Play"}
              </Button>
            </div>
            <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
          </CardContent>
        </Card>
      )}

      {/* Note Details 
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Note Title (Optional)</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Client call with John Smith"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="clientName">Client Name (Optional)</Label>
          <Input
            id="clientName"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="e.g., John Smith"
            className="mt-1"
          />
        </div>
      </div>
      */}
      {/* Process Button 
      <Button
        onClick={() => processAudio()}
        disabled={!audioBlob || isProcessing}
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
      */}
    </div>
  )
}
