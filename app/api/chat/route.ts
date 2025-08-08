import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { groq } from '@ai-sdk/groq';
import { WELLNESS_SYSTEM_PROMPT, COACH_SYSTEM_PROMPT, THERAPIST_SYSTEM_PROMPT } from '@/lib/prompt';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const body = await req.json();
  const { messages } = body;
  
  // Check if web search is enabled from the last message's metadata
  const lastMessage = messages[messages.length - 1];
  const useWebSearch = lastMessage?.metadata?.useWebSearch || false;
  const modelId = lastMessage?.metadata?.modelId || 'gpt-4o-mini';
  const provider = lastMessage?.metadata?.provider || 'openai';
  
  let systemPrompt = WELLNESS_SYSTEM_PROMPT;
  if (modelId === "coach") {
    systemPrompt = COACH_SYSTEM_PROMPT;
  } else if (modelId === "therapist") {
    systemPrompt = THERAPIST_SYSTEM_PROMPT;
  }

  // Convert messages and add system prompt
  const convertedMessages = convertToModelMessages(messages);
  
  // Add wellness system prompt
  const messagesWithSystem = [
    { role: 'system', content: systemPrompt },
    ...convertedMessages
  ];

  const result = streamText({
    model:
      provider === 'openai'
        ? openai.responses(modelId)
        : provider === 'anthropic'
        ? anthropic(modelId)
        : provider === 'google'
        ? google(modelId)
        : groq(modelId),
    messages: messagesWithSystem,
    // Note: Web search is only available with OpenAI models
    ...(useWebSearch && provider === 'openai' && {
      tools: {
        web_search_preview: openai.tools.webSearchPreview({
          searchContextSize: 'high',
        }),
      },
    }),
  });

  return result.toUIMessageStreamResponse({ sendSources: true });
}
