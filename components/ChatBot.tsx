'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'error' | 'info';
  content: string;
  timestamp: Date;
}

export default function ChatBot() {
  const [url, setUrl] = useState('');
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [urlSubmitted, setUrlSubmitted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmitUrl = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      addMessage('Please enter a URL', 'error');
      return;
    }

    setLoading(true);
    addMessage(`Loading content from: ${url}`, 'info');

    try {
      // Validate by attempting to fetch metadata
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, question: 'test' })
      });

      const data = await response.json();

      if (!response.ok) {
        addMessage(`Error: ${data.error}`, 'error');
        setLoading(false);
        return;
      }

      addMessage(
        `✓ Successfully loaded: ${url}\n\nPreview: ${data.contentPreview}`,
        'info'
      );
      setUrlSubmitted(true);
    } catch (error) {
      addMessage(
        `Error loading URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim()) {
      addMessage('Please enter a question', 'error');
      return;
    }

    if (!urlSubmitted) {
      addMessage('Please load a URL first', 'error');
      return;
    }

    const userQuestion = question;
    addMessage(userQuestion, 'user');
    setQuestion('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, question: userQuestion })
      });

      const data = await response.json();

      if (!response.ok) {
        addMessage(`Error: ${data.error}`, 'error');
      } else {
        addMessage(data.answer, 'assistant');
      }
    } catch (error) {
      addMessage(
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const addMessage = (content: string, type: Message['type']) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleReset = () => {
    setUrl('');
    setQuestion('');
    setMessages([]);
    setUrlSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">Link Chat</h1>
          <p className="text-gray-600">
            Ask questions about any webpage
          </p>
        </div>

        {/* Main Chat Container */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Sidebar - URL Input */}
          <Card className="md:col-span-1 flex flex-col p-6">
            <h2 className="mb-4 font-semibold text-gray-900">Load a URL</h2>
            <form onSubmit={handleSubmitUrl} className="flex flex-col gap-4 flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL
                </label>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={urlSubmitted || loading}
                  className="w-full"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  type="submit"
                  disabled={loading || urlSubmitted}
                  className="w-full"
                >
                  {loading ? 'Loading...' : urlSubmitted ? 'Loaded ✓' : 'Load'}
                </Button>
                {urlSubmitted && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    className="w-full"
                  >
                    Reset
                  </Button>
                )}
              </div>
              {urlSubmitted && (
                <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                  URL loaded successfully! Ask your questions below.
                </div>
              )}
            </form>
          </Card>

          {/* Main Chat Area */}
          <Card className="md:col-span-2 flex flex-col p-6">
            {/* Messages Container */}
            <div className="mb-6 flex flex-1 flex-col gap-4 overflow-y-auto max-h-[500px] pr-2">
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full text-center">
                  <div className="text-gray-500">
                    <p className="text-lg font-medium mb-2">No messages yet</p>
                    <p className="text-sm">Load a URL and ask a question to get started</p>
                  </div>
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs rounded-lg px-4 py-3 lg:max-w-md ${
                      message.type === 'user'
                        ? 'bg-indigo-600 text-white'
                        : message.type === 'error'
                        ? 'bg-red-100 text-red-800'
                        : message.type === 'info'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-sm">
                      {message.content}
                    </p>
                    <p className="mt-1 text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Question Input */}
            {urlSubmitted && (
              <form onSubmit={handleSubmitQuestion} className="flex flex-col gap-3">
                <Textarea
                  placeholder="Ask a question about the loaded content..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  disabled={loading || !urlSubmitted}
                  className="resize-none"
                  rows={3}
                />
                <Button
                  type="submit"
                  disabled={loading || !urlSubmitted || !question.trim()}
                  className="w-full"
                >
                  {loading ? 'Thinking...' : 'Ask'}
                </Button>
              </form>
            )}
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Link Chat - Ask questions about any webpage</p>
        </div>
      </div>
    </div>
  );
}
