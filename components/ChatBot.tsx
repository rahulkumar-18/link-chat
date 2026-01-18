'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import ChatLayout from '@/components/ChatLayout';
import { Send, Globe, Trash2, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'error' | 'info';
  content: string;
  timestamp: string; // Changed to string for serialization
}

export default function ChatBot() {
  const [url, setUrl] = useState('');
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [urlSubmitted, setUrlSubmitted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Local Storage
  useEffect(() => {
    const savedMessages = localStorage.getItem('link-chat-history');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error('Failed to parse chat history', e);
      }
    }

    // Check if URL was previously loaded state (simplified)
    const savedUrl = localStorage.getItem('link-chat-url');
    if (savedUrl) {
      setUrl(savedUrl);
      setUrlSubmitted(true); // Assume loaded if url exists for now
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('link-chat-history', JSON.stringify(messages));
    if (urlSubmitted) {
      localStorage.setItem('link-chat-url', url);
    }
  }, [messages, url, urlSubmitted]);

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
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleReset = () => {
    setUrl('');
    setQuestion('');
    setMessages([]);
    setUrlSubmitted(false);
    localStorage.removeItem('link-chat-history');
    localStorage.removeItem('link-chat-url');
  };

  const SidebarContent = (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center gap-2 px-2">
        <div className="bg-primary/20 flex h-8 w-8 items-center justify-center rounded-lg backdrop-blur-md">
          <Globe className="text-primary h-5 w-5" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">Query Chat</h1>
      </div>

      <div className="flex flex-1 flex-col gap-4">
        <Card className="border-sidebar-border bg-sidebar-accent/50 p-4 shadow-none backdrop-blur-none">
          <h2 className="mb-3 text-sm font-semibold text-sidebar-foreground">
            Target Website
          </h2>
          <form onSubmit={handleSubmitUrl} className="flex flex-col gap-3">
            <Input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={urlSubmitted || loading}
              className="bg-sidebar-primary/10 border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/50 h-9"
            />
            <Button
              type="submit"
              disabled={loading || urlSubmitted}
              className="w-full shadow-lg"
              size="sm"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : urlSubmitted ? (
                'Source Loaded'
              ) : (
                'Load Source'
              )}
            </Button>

            {urlSubmitted && (
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="hover:bg-destructive/20 hover:text-destructive border-destructive/30 text-destructive/80 w-full"
                size="sm"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Reset Session
              </Button>
            )}
          </form>
        </Card>

        {/* Info/Stats Area Could Go Here */}
        <div className="text-sidebar-foreground/40 mt-auto px-2 text-xs">
          <p>Version 2.0.0</p>
          <p>Deep Black Edition</p>
        </div>
      </div>
    </div>
  );

  return (
    <ChatLayout sidebar={SidebarContent}>
      <div className="flex h-full flex-col bg-background">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center opacity-50">
              <div className="bg-primary/5 rounded-full p-6 mb-4 ring-1 ring-primary/20">
                <Bot className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-foreground">Ready to Chat</h3>
              <p className="text-muted-foreground max-w-sm text-sm mt-2">
                Enter a URL in the sidebar to load context, then ask any question about the content.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex w-full items-start gap-3 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
            >
              {/* Avatar */}
              <div className={`
                flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium ring-1 shadow-lg
                ${message.type === 'user'
                  ? 'bg-primary text-primary-foreground ring-primary/50'
                  : 'bg-secondary text-secondary-foreground ring-white/10'
                }
              `}>
                {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`
                relative max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm
                ${message.type === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-sm shadow-[0_4px_20px_rgba(45,225,252,0.15)]' // Electric Blue User
                  : message.type === 'error'
                    ? 'bg-destructive/10 text-destructive border border-destructive/20 rounded-tl-sm'
                    : message.type === 'info'
                      ? 'bg-blue-500/10 text-blue-200 border border-blue-500/20 rounded-tl-sm'
                      : 'bg-card border border-white/5 text-card-foreground rounded-tl-sm shadow-md' // Assistant
                }
              `}>
                {message.type === 'assistant' ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none break-words prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-pre:p-4 prose-pre:rounded-lg prose-code:text-primary/80 prose-code:bg-black/30 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-a:text-primary prose-a:no-underline hover:prose-a:underline [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({ node, ...props }) => (
                          <a {...props} target="_blank" rel="noopener noreferrer" />
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}
                <div className={`mt-1.5 text-[10px] opacity-50 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-white/5 bg-background/80 p-4 backdrop-blur-md">
          <form onSubmit={handleSubmitQuestion} className="relative mx-auto max-w-3xl">
            <div className={`transition-all duration-300 ${urlSubmitted ? 'opacity-100' : 'opacity-50 grayscale'}`}>
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question about the content..."
                disabled={loading || !urlSubmitted}
                className="bg-secondary/30 h-14 pl-5 pr-14 text-base shadow-inner rounded-2xl border-white/5 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
              />
              <Button
                type="submit"
                disabled={loading || !urlSubmitted || !question.trim()}
                size="icon"
                className="absolute right-2 top-2 h-10 w-10 rounded-xl shadow-none hover:shadow-lg hover:translate-y-[-1px] transition-all"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </form>
          <div className="mt-2 text-center text-xs text-muted-foreground/30">
            Powered by Gemini API • Query Chat
          </div>
        </div>
      </div>
    </ChatLayout>
  );
}
