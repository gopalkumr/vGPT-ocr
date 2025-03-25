import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type ChatMessage = {
  id?: string;
  user_id?: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  created_at?: string;
  chat_id: string;
};

export type Chat = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export type FileUpload = {
  id: string;
  user_id: string;
  chat_id: string;
  path: string;
  filename: string;
  content_type: string;
  created_at: string;
  extracted_text?: string;
};

export async function getChatHistory(userId: string) {
  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }
  
  return data as Chat[];
}

export async function getChatMessages(chatId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });
    
  if (error) {
    console.error('Error fetching chat messages:', error);
    return [];
  }
  
  return data as ChatMessage[];
}

export async function saveMessage(message: ChatMessage) {
  const { data, error } = await supabase
    .from('messages')
    .insert([message])
    .select();
    
  if (error) {
    console.error('Error saving message:', error);
    return null;
  }
  
  return data[0] as ChatMessage;
}

export async function createChat(userId: string, title: string) {
  const { data, error } = await supabase
    .from('chats')
    .insert([{ user_id: userId, title }])
    .select();
    
  if (error) {
    console.error('Error creating chat:', error);
    return null;
  }
  
  return data[0] as Chat;
}

export async function updateChatTitle(chatId: string, title: string) {
  const { error } = await supabase
    .from('chats')
    .update({ title })
    .match({ id: chatId });
    
  if (error) {
    console.error('Error updating chat title:', error);
    return false;
  }
  
  return true;
}

export async function deleteChat(chatId: string) {
  const { error: messagesError } = await supabase
    .from('messages')
    .delete()
    .eq('chat_id', chatId);
    
  if (messagesError) {
    console.error('Error deleting chat messages:', messagesError);
    return false;
  }
  
  const { error: chatError } = await supabase
    .from('chats')
    .delete()
    .eq('id', chatId);
    
  if (chatError) {
    console.error('Error deleting chat:', chatError);
    return false;
  }
  
  return true;
}

export async function saveFileUpload(upload: Omit<FileUpload, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('file_uploads')
    .insert([upload])
    .select();
    
  if (error) {
    console.error('Error saving file upload:', error);
    return null;
  }
  
  return data[0] as FileUpload;
}

export async function getChatFiles(chatId: string) {
  const { data, error } = await supabase
    .from('file_uploads')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching chat files:', error);
    return [];
  }
  
  return data as FileUpload[];
}

export async function uploadFile(file: File, userId: string, chatId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${chatId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `uploads/${fileName}`;
  
  const { error: uploadError } = await supabase.storage
    .from('files')
    .upload(filePath, file);
    
  if (uploadError) {
    console.error('Error uploading file:', uploadError);
    return null;
  }
  
  const { data: publicURL } = supabase.storage
    .from('files')
    .getPublicUrl(filePath);
    
  const fileUpload = {
    user_id: userId,
    chat_id: chatId,
    path: filePath,
    filename: file.name,
    content_type: file.type
  };
  
  return saveFileUpload(fileUpload);
}
