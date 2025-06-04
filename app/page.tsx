"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Mic, Upload, TrendingUp } from "lucide-react"
import AudioRecorder from "@/components/audio-recorder"
import FileUpload from "@/components/file-upload"
import NotesList from "@/components/notes-list"
import type { Note } from "@/types/note"

export default function BrokerNotesApp() {
  const [notes, setNotes] = useState<Note[]>([])
  const [activeTab, setActiveTab] = useState("record")

  useEffect(() => {
    // Load notes from localStorage on component mount
    const savedNotes = localStorage.getItem("broker-notes")
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes))
    }
  }, [])

  const saveNote = (note: Note) => {
    const updatedNotes = [note, ...notes]
    setNotes(updatedNotes)
    localStorage.setItem("broker-notes", JSON.stringify(updatedNotes))
  }

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter((note) => note.id !== id)
    setNotes(updatedNotes)
    localStorage.setItem("broker-notes", JSON.stringify(updatedNotes))
  }

  const recentNotes = notes.slice(0, 3)

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Reveal Whisper</h1>
        </div>


        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Recording/Upload */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Create New Note</CardTitle>
                <CardDescription>
                  Record a conversation or upload an audio file for transcription and analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="record" className="flex items-center gap-2">
                      <Mic className="h-4 w-4" />
                      Record
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Upload
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="record" className="mt-6">
                    <AudioRecorder onSaveNote={saveNote} />
                  </TabsContent>
                  <TabsContent value="upload" className="mt-6">
                    <FileUpload onSaveNote={saveNote} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Recent Notes */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentNotes.length > 0 ? (
                  <div className="space-y-4">
                    {recentNotes.map((note) => (
                      <div key={note.id} className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm">{note.title}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </Badge>
                        </div>
                        {note.clientName && <p className="text-xs text-gray-600 mb-1">Client: {note.clientName}</p>}
                        <p className="text-xs text-gray-500 line-clamp-2">{note.summary.substring(0, 100)}...</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No notes yet. Create your first note above!</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Notes List */}
        {notes.length > 0 && (
          <div className="mt-8">
            <NotesList notes={notes} onDeleteNote={deleteNote} />
          </div>
        )}
      </div>
    </div>
  )
}
