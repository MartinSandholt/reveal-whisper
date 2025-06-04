"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp, Trash2, User, Calendar, FileText, CheckSquare } from "lucide-react"
import type { Note } from "@/types/note"

interface NotesListProps {
  notes: Note[]
  onDeleteNote: (id: string) => void
}

export default function NotesList({ notes, onDeleteNote }: NotesListProps) {
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set())

  const toggleExpanded = (noteId: string) => {
    const newExpanded = new Set(expandedNotes)
    if (newExpanded.has(noteId)) {
      newExpanded.delete(noteId)
    } else {
      newExpanded.add(noteId)
    }
    setExpandedNotes(newExpanded)
  }

  const handleDelete = (noteId: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      onDeleteNote(noteId)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Notes</CardTitle>
        <CardDescription>Your conversation transcripts and analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notes.map((note) => {
            const isExpanded = expandedNotes.has(note.id)
            return (
              <Collapsible key={note.id}>
                <Card className="border border-gray-200">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <CardTitle className="text-lg">{note.title}</CardTitle>
                            <div className="flex items-center space-x-2">
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(note.id)
                                }}
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5 text-gray-500" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-gray-500" />
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                            </div>
                            {note.clientName && (
                              <div className="flex items-center space-x-1">
                                <User className="h-4 w-4" />
                                <span>{note.clientName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-6">
                        {/* Summary */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            Summary
                          </h4>
                          <p className="text-gray-700 leading-relaxed">{note.summary}</p>
                        </div>

                        {/* Follow-up Items */}
                        {note.followUpItems.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                              <CheckSquare className="h-4 w-4 mr-2" />
                              Follow-up Items
                            </h4>
                            <div className="space-y-2">
                              {note.followUpItems.map((item, index) => (
                                <div key={index} className="flex items-start space-x-2">
                                  <Badge variant="outline" className="mt-0.5">
                                    {index + 1}
                                  </Badge>
                                  <span className="text-gray-700">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Full Transcript */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Full Transcript</h4>
                          <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{note.transcript}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
