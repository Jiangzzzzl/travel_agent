import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function POST() {
  const model = google('gemini-1.5-flash');
  
  const result = await generateText({
    model,
    prompt: 'Say hello in Chinese',
    maxOutputTokens: 50,
  });
  
  return Response.json({
    text: result.text,
  });
}