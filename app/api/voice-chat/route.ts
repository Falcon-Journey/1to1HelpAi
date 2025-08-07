import { openai } from '@ai-sdk/openai';

export const maxDuration = 30;

// Dedicated voice chat endpoint for real-time voice responses
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, voice = 'alloy', model = 'tts-1' } = body;

    if (!text) {
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate audio using OpenAI TTS
    const audioResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model, // 'tts-1' or 'tts-1-hd'
        input: text,
        voice: voice, // alloy, echo, fable, onyx, nova, shimmer
        response_format: 'mp3',
        speed: 1.0,
      }),
    });

    if (!audioResponse.ok) {
      const error = await audioResponse.text();
      console.error('OpenAI TTS Error:', error);
      return new Response(JSON.stringify({ error: 'Failed to generate audio' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Return audio as binary stream
    const audioBuffer = await audioResponse.arrayBuffer();
    
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('Voice chat error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
