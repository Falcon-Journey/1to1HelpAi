// app/api/transcribe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { IncomingForm } from 'formidable'
import fs from 'fs'
import path from 'path'
import { OpenAI } from 'openai'

// Disable Next.js body parser
export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(req: NextRequest) {
  try {
    const formData = await parseFormData(req)

    const audioFilePath = formData.filepath
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

    const fileStream = fs.createReadStream(audioFilePath)

    const transcription = await openai.audio.transcriptions.create({
      file: fileStream,
      model: 'whisper-1',
    })

    return NextResponse.json({ text: transcription.text })
  } catch (err) {
    console.error('Error:', err)
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
  }
}

// Helper function to parse multipart form data
function parseFormData(req: NextRequest): Promise<{ filepath: string }> {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({ uploadDir: '/tmp', keepExtensions: true })

    // @ts-ignore: req is not the expected Node type, workaround for Next.js
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err)

      const file = files.audio
      if (!file || Array.isArray(file) || !file) {
        return reject(new Error('Audio file missing or invalid'))
      }

      resolve({ filepath: file })
    })
  })
}
