
import React from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, PlusCircle } from 'lucide-react';
import DeleteChat from './DeleteChat';

const ChatHistory = () => {
  const { chats, loadingChats, selectChat, createNewChat, deleteChat, currentChatId } = useChat();

  if (loadingChats) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        className="w-full justify-start gap-2"
        onClick={() => createNewChat()}
      >
        <PlusCircle className="h-4 w-4" />
        New Chat
      </Button>
      
      {chats.length > 0 ? (
        <div className="space-y-1">
          {chats.map((chat) => (
            <div key={chat.id} className="flex items-center justify-between">
              <Button
                variant={currentChatId === chat.id ? 'secondary' : 'ghost'}
                className="flex-grow justify-start gap-2 overflow-hidden"
                onClick={() => selectChat(chat.id)}
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                <span className="truncate">{chat.title}</span>
              </Button>
              <DeleteChat chatId={chat.id} onDelete={deleteChat} />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center">
          <p className="text-sm text-muted-foreground">No chat history yet</p>
        </div>
      )}
    </div>
  );
};

export default ChatHistory;
