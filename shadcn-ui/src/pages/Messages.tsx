import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, ArrowLeft } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { messagesStorage, ridesStorage } from '@/lib/storage';
import { generateId } from '@/lib/auth';
import { User, Message, Ride, ChatConversation } from '@/types';

/**
 * A page that displays a user's messages and allows them to chat with other users.
 * It shows a list of conversations and a chat window for the selected conversation.
 * @returns The rendered page component.
 */
export default function Messages() {
  const [user, setUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    if (currentUser) {
      loadConversations(currentUser);
    }
    setLoading(false);
  }, []);

  const loadConversations = (currentUser: User) => {
    const allMessages = messagesStorage.getMessages();
    const allRides = ridesStorage.getRides();
    
    // Group messages by ride and participants
    const conversationMap = new Map<string, ChatConversation>();
    
    allMessages.forEach(message => {
      if (message.senderId === currentUser.id || message.receiverId === currentUser.id) {
        const otherUserId = message.senderId === currentUser.id ? message.receiverId : message.senderId;
        const conversationKey = `${message.rideId}-${otherUserId}`;
        
        if (!conversationMap.has(conversationKey)) {
          const ride = allRides.find(r => r.id === message.rideId);
          const otherUser = message.senderId === currentUser.id ? message.receiver : message.sender;
          
          if (ride && otherUser) {
            conversationMap.set(conversationKey, {
              id: conversationKey,
              participants: [currentUser, otherUser],
              rideId: message.rideId,
              lastMessage: message,
              unreadCount: 0,
            });
          }
        } else {
          const conversation = conversationMap.get(conversationKey)!;
          if (new Date(message.createdAt) > new Date(conversation.lastMessage!.createdAt)) {
            conversation.lastMessage = message;
          }
          if (!message.isRead && message.receiverId === currentUser.id) {
            conversation.unreadCount++;
          }
        }
      }
    });

    const conversationsList = Array.from(conversationMap.values())
      .sort((a, b) => {
        const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
        const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
        return bTime - aTime;
      });

    setConversations(conversationsList);
  };

  const loadMessages = (conversation: ChatConversation) => {
    if (!user) return;
    
    const otherUser = conversation.participants.find(p => p.id !== user.id);
    if (!otherUser) return;

    const conversationMessages = messagesStorage.getConversationMessages(
      user.id,
      otherUser.id,
      conversation.rideId
    );
    
    setMessages(conversationMessages);
    
    // Mark messages as read
    messagesStorage.markMessagesAsRead(user.id, conversation.rideId);
    
    // Update conversation unread count
    const updatedConversations = conversations.map(c => 
      c.id === conversation.id ? { ...c, unreadCount: 0 } : c
    );
    setConversations(updatedConversations);
  };

  const handleSelectConversation = (conversation: ChatConversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation);
  };

  const handleSendMessage = async () => {
    if (!user || !selectedConversation || !newMessage.trim()) return;

    const otherUser = selectedConversation.participants.find(p => p.id !== user.id);
    if (!otherUser) return;

    const message: Message = {
      id: generateId(),
      senderId: user.id,
      sender: user,
      receiverId: otherUser.id,
      receiver: otherUser,
      rideId: selectedConversation.rideId,
      content: newMessage.trim(),
      messageType: 'text',
      isRead: false,
      createdAt: new Date(),
    };

    messagesStorage.addMessage(message);
    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Update conversation last message
    const updatedConversations = conversations.map(c => 
      c.id === selectedConversation.id 
        ? { ...c, lastMessage: message }
        : c
    );
    setConversations(updatedConversations);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    
    if (now.toDateString() === messageDate.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 h-[calc(100vh-8rem)]">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>Messages</span>
            </CardTitle>
            <CardDescription>
              Chat with drivers and passengers
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {conversations.length > 0 ? (
              <div className="space-y-0">
                {conversations.map((conversation) => {
                  const otherUser = conversation.participants.find(p => p.id !== user?.id);
                  const ride = ridesStorage.getRides().find(r => r.id === conversation.rideId);
                  
                  return (
                    <div
                      key={conversation.id}
                      onClick={() => handleSelectConversation(conversation)}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {otherUser ? `${otherUser.firstName[0]}${otherUser.lastName[0]}` : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm truncate">
                              {otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unknown User'}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 text-xs">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          
                          {ride && (
                            <p className="text-xs text-gray-600 truncate">
                              {ride.fromLocation.city} → {ride.toLocation.city}
                            </p>
                          )}
                          
                          {conversation.lastMessage && (
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-xs text-gray-500 truncate">
                                {conversation.lastMessage.content}
                              </p>
                              <span className="text-xs text-gray-400">
                                {formatMessageTime(conversation.lastMessage.createdAt)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No conversations yet</p>
                <p className="text-sm">Messages will appear here when you start chatting</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <CardHeader className="border-b">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedConversation(null)}
                    className="lg:hidden"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {(() => {
                        const otherUser = selectedConversation.participants.find(p => p.id !== user?.id);
                        return otherUser ? `${otherUser.firstName[0]}${otherUser.lastName[0]}` : 'U';
                      })()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <CardTitle className="text-lg">
                      {(() => {
                        const otherUser = selectedConversation.participants.find(p => p.id !== user?.id);
                        return otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unknown User';
                      })()}
                    </CardTitle>
                    <CardDescription>
                      {(() => {
                        const ride = ridesStorage.getRides().find(r => r.id === selectedConversation.rideId);
                        return ride ? `${ride.fromLocation.city} → ${ride.toLocation.city}` : 'Ride chat';
                      })()}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === user?.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.senderId === user?.id ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatMessageTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm">Choose a conversation from the list to start chatting</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}