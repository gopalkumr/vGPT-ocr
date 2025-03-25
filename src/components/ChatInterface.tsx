import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Send, Loader2, User, Bot, ArrowRight } from 'lucide-react';
import FileUpload from './FileUpload';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ChatInterface = () => {
  const { messages, sendMessage, isProcessing, currentChatId } = useChat();
  const { user, freeChatsCount } = useAuth();
  const [inputMessage, setInputMessage] = useState('');
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() && !extractedText) return;
    
    const messageToSend = extractedText 
      ? `${inputMessage}\n\nExtracted text from document:\n${extractedText}` 
      : inputMessage;
      
    await sendMessage(messageToSend);
    setInputMessage('');
    setExtractedText(null);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileProcessed = (text: string) => {
    setExtractedText(text);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden pt-16">
      {!user && freeChatsCount >= 2 && (
        <div className="bg-secondary/50 backdrop-blur-sm p-3 border-b border-border sticky top-16 z-10">
          <div className="max-w-md mx-auto flex items-center gap-3 justify-between">
            <div className="text-sm">
              <p className="font-medium">Free limit reached</p>
              <p className="text-muted-foreground">Sign up to continue chatting</p>
            </div>
            <Link to="/auth?mode=signup">
              <Button size="sm">
                Sign up
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-3xl mx-auto pt-8 space-y-8">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[50vh]">
              <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-4">
                <Bot className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl font-medium">Welcome to vGPT</h2>
              <p className="text-muted-foreground text-center max-w-md mt-2">
                Start a conversation, upload a document, or ask anything.
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`flex max-w-[85%] items-start gap-3 ${
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md ${
                      message.role === 'user'
                        ? 'bg-primary/10'
                        : 'bg-secondary'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="h-5 w-5 text-primary" />
                    ) : (
                      <Bot className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <Card
                      className={`px-4 py-3 shadow-sm ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : ''
                      }`}
                    >
                      {message.role === 'assistant' ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown
                            components={{
                              code({className, children, ...props}) {
                                const match = /language-(\w+)/.exec(className || '');
                                return !className ? (
                                  <code {...props}>
                                    {children}
                                  </code>
                                ) : (
                                  <SyntaxHighlighter
                                    language={match ? match[1] : ''}
                                    style={vscDarkPlus}
                                    PreTag="div"
                                    {...props}
                                  >
                                    {String(children).replace(/\n$/, '')}
                                  </SyntaxHighlighter>
                                );
                              }
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="prose prose-sm max-w-none">
                          {message.content.split('\n').map((line, i) => (
                            <React.Fragment key={i}>
                              {line}
                              {i < message.content.split('\n').length - 1 && <br />}
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                    </Card>
                    {message.created_at && (
                      <div
                        className={`text-xs mt-1 ${
                          message.role === 'user'
                            ? 'text-right'
                            : 'text-left'
                        } text-muted-foreground`}
                      >
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="flex max-w-[85%] items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary">
                  <Bot className="h-5 w-5" />
                </div>
                <Card className="px-4 py-3 shadow-sm">
                  <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </Card>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          {extractedText && (
            <div className="mb-3 p-3 bg-secondary rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Extracted text from document:</p>
              <p className="text-sm line-clamp-2">{extractedText}</p>
            </div>
          )}
          <div className="flex items-end gap-2">
            <FileUpload
              onFileProcessed={handleFileProcessed}
              disabled={isProcessing || (!user && freeChatsCount >= 2)}
            />
            <div className="relative flex-1">
              <Textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="min-h-[50px] max-h-[200px] py-3 pr-12 resize-none"
                disabled={isProcessing || (!user && freeChatsCount >= 2)}
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-2 bottom-2 h-8 w-8"
                disabled={isProcessing || (!inputMessage.trim() && !extractedText) || (!user && freeChatsCount >= 2)}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
