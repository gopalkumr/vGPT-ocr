
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Clock, User, CalendarDays, ArrowRight } from 'lucide-react';

const History = () => {
  const { user, isLoading } = useAuth();
  const { chats, loadingChats, selectChat } = useChat();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if not authenticated and not loading
    if (!isLoading && !user) {
      navigate('/auth?mode=signin&redirect=/history');
    }
  }, [user, isLoading, navigate]);

  const handleChatSelect = (chatId: string) => {
    selectChat(chatId);
    navigate('/chat');
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="text-center">
            <Skeleton className="h-8 w-40 mx-auto mb-4" />
            <Skeleton className="h-4 w-60 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold mb-2">Your Chat History</h1>
            <p className="text-muted-foreground">
              View and continue your previous conversations
            </p>
          </div>
          
          {loadingChats ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-9 w-24" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : chats.length > 0 ? (
            <div className="space-y-4">
              {chats.map((chat) => (
                <Card 
                  key={chat.id} 
                  className="transition-all hover:shadow-md cursor-pointer"
                  onClick={() => handleChatSelect(chat.id)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{chat.title}</CardTitle>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(chat.created_at)}
                      </div>
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {user.email}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="justify-end">
                    <Button 
                      variant="ghost" 
                      className="gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChatSelect(chat.id);
                      }}
                    >
                      Continue Chat
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-secondary mx-auto flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No chat history yet</h3>
              <p className="text-muted-foreground mb-6">
                Start a new conversation to see your history here
              </p>
              <Button onClick={() => navigate('/chat')}>
                Start a new chat
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
