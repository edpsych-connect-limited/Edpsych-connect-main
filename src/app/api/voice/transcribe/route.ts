
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  try {
    // Check if OpenAI key is configured
    const openAiApiKey = process.env.OPENAI_API_KEY;
    if (!openAiApiKey) {
      return NextResponse.json(
        { error: 'Server-side transcription not configured (missing API key)' },
        { status: 503 }
      );
    }

    const openai = new OpenAI({ apiKey: openAiApiKey });

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Create a temporary file path
    const tempDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempFilePath = path.join(tempDir, `${uuidv4()}.webm`);
    fs.writeFileSync(tempFilePath, buffer);

    try {
      // Call OpenAI Whisper API
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: 'whisper-1',
        language: 'en', // Optimize for English
        prompt: 'EdPsych Connect, SENCO, EHCP, assessment, dashboard, Dr. Scott', // Context hints
      });

      // Clean up temp file
      fs.unlinkSync(tempFilePath);

      return NextResponse.json({
        text: transcription.text,
        success: true
      });

    } catch (apiError) {
      // Clean up temp file in case of error
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      throw apiError;
    }

  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}
