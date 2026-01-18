import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { url, question } = await request.json();

    if (!url || !question) {
      return NextResponse.json(
        { error: 'URL and question are required' },
        { status: 400 }
      );
    }

    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured. Please set NEXT_PUBLIC_GEMINI_API_KEY in your .env.local file.' },
        { status: 500 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Fetch the content from the URL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.statusText}` },
        { status: 400 }
      );
    }

    const html = await response.text();
    
    // Extract text content from HTML
    const text = html
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (text.length === 0) {
      return NextResponse.json(
        { error: 'No text content found in the provided URL' },
        { status: 400 }
      );
    }

    // Truncate content to reasonable size for Gemini context (around 10000 chars)
    const content = text.substring(0, 10000);
    const contentPreview = content.substring(0, 200) + '...';

    // Use Gemini API to generate answer
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `You are a helpful assistant that answers questions about web page content.

Page Content:
${content}

User Question: ${question}

Please provide a clear and concise answer based on the provided page content. If the answer cannot be found in the content, say so politely.`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    return NextResponse.json({
      success: true,
      answer,
      contentPreview
    });
  } catch (error) {
    console.error('Error:', error);
    
    // Check if it's an API error
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Invalid Gemini API key. Please check your .env.local file.' },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
