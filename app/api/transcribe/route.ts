import { experimental_transcribe as transcribe } from "ai"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { type NextRequest, NextResponse } from "next/server"

type LLMAnalysis = {
  summary: string;
  followUpItems: string[];
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File
    //const title = formData.get("title") as string
    //const clientName = formData.get("clientName") as string

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    // Convert file to buffer
    const audioBuffer = await audioFile.arrayBuffer()
    const audioUint8Array = new Uint8Array(audioBuffer)

    // Transcribe the audio using Whisper
    const transcriptionResult = await transcribe({
      model: openai.transcription("whisper-1"),
      audio: audioUint8Array,
    })

    const transcript = transcriptionResult.text

    // Generate summary and follow-up items
    const analysisPrompt = `
You are an AI assistant helping a broker analyze a conversation transcript. Please provide:

1. A concise summary of the conversation (2-3 sentences)
2. A list of specific follow-up items or action items that the broker should address

Here is the transcript:
${transcript}

Always format your response as JSON with the following structure:
{
  "summary": "Your summary here",
  "followUpItems": ["Item 1", "Item 2", "Item 3"]
}
`

    const analysisResult = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: analysisPrompt,
      temperature: 0.1,
    })

    let analysis: LLMAnalysis
    try {
      analysis = extractJsonFromLLMResponse(analysisResult.text)
    } catch (parseError) {
      console.error("JSON parse error:", parseError)
      // Fallback if JSON parsing fails
      analysis = {
        summary: "Parsing did not work",
        followUpItems: ["Review transcript manually", "Follow up with client"],
      }
    }

    return NextResponse.json({
      transcript,
      summary: analysis.summary,
      followUpItems: analysis.followUpItems || [],
    })
  } catch (error) {
    console.error("Error processing audio:", error)
    return NextResponse.json({ error: "Failed to process audio file" }, { status: 500 })
  }
}

function extractJsonFromLLMResponse(response: string): LLMAnalysis {
  // Remove leading/trailing whitespace
  let cleaned = response.trim();

  // Remove code block markers (```json ... ```, ``` ... ```)
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-z]*\n?/i, '').replace(/```$/, '');
  }

  // Now parse as JSON
  return JSON.parse(cleaned);
}
