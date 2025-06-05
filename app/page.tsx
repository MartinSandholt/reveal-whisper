"use client"

import { useState, useEffect } from "react"
import AudioRecorder from "@/components/audio-recorder"
import NotesList from "@/components/notes-list"
import type { Note } from "@/types/note"

export default function BrokerNotesApp() {
  const [notes, setNotes] = useState<Note[]>([])

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

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-6xl mx-auto">

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Recording/Upload */}
          <div className="lg:col-span-3">
          <AudioRecorder onSaveNote={saveNote} />
            {/*<Card>
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
            </Card>*/}
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
