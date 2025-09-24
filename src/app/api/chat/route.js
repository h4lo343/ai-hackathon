import { getAISystemPrompt } from '@/app/generateSystemPrompt';
import { NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export async function POST(request) {
  try {
    // Check if OpenAI API key is configured
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { context, messages } = body;

    if (!context || !messages) {
      return NextResponse.json(
        { error: 'Context and messages are required' },
        { status: 400 }
      );
    }

    // Filter out system messages and prepare the conversation for OpenAI
    const conversationMessages = messages
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }));

    // Check if this is the initial context response (no user messages yet)

    // Create the system message with context
    let systemMessage;
      systemMessage = {
        role: 'system',
        content: getAISystemPrompt(context),
      };

    // Prepare the messages array for OpenAI API
    const openaiMessages = [systemMessage, ...conversationMessages];

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: openaiMessages,
        max_tokens: 1000,
        temperature: 0.7,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', errorData);
      return NextResponse.json(
        { error: `OpenAI API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return NextResponse.json(
        { error: 'Invalid response from OpenAI API' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      response: data.choices[0].message.content,
      usage: data.usage,
      model: data.model
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: Add GET method for health check
export async function GET() {
  return NextResponse.json({
    status: 'Chat API is running',
    timestamp: new Date().toISOString()
  });
}
