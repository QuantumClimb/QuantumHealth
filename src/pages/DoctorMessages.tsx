
import React, { useState, useEffect } from 'react';
import { MessageList } from '@/components/messages/MessageList';
import { MessageDetail, Message } from '@/components/messages/MessageDetail';
import Layout from '@/components/Layout';
import { multiTenantService, type Conversation, type Message as MessageType } from '@/services/supabaseService';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';

const DoctorMessages = () => {
  const [selectedMessageId, setSelectedMessageId] = useState<string | undefined>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast: showToast } = useToast();
  
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const conversationsData = await multiTenantService.getConversations();
      setConversations(conversationsData);
      console.log('💬 Conversations loaded:', conversationsData.length);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Failed to load conversations. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const messagesData = await multiTenantService.getMessages(conversationId);
      setMessages(messagesData);
      console.log('📨 Messages loaded for conversation:', conversationId, messagesData.length);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages.');
    }
  };
  
  const selectedConversation = selectedMessageId ? conversations.find(c => c.id === selectedMessageId) : null;
  
  const handleSelectMessage = async (id: string) => {
    setSelectedMessageId(id);
    await loadMessages(id);
  };
  
  const handleSendMessage = async (content: string) => {
    if (!selectedConversation) return;
    
    try {
      const newMessage = await multiTenantService.createMessage({
        conversation_id: selectedConversation.id,
        sender_id: 'current-doctor-id', // This should come from auth context
        recipient_id: selectedConversation.participant_1_id === 'current-doctor-id' 
          ? selectedConversation.participant_2_id 
          : selectedConversation.participant_1_id,
        content,
        message_type: 'text',
        is_urgent: false,
        is_read: false,
        sender_type: 'doctor',
        recipient_type: 'patient'
      });

      if (newMessage) {
        setMessages(prev => [...prev, newMessage]);
        showToast({
          title: "Message sent",
          description: "Your message has been sent successfully.",
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    }
  };

  if (loading) {
    return (
      <Layout userRole="doctor">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-healthy-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading conversations...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout userRole="doctor">
      <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)]">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Messages</h1>
          <p className="text-gray-500">Communicate with your patients</p>
        </header>
        
        <div className="glass-card h-[calc(100%-5rem)] overflow-hidden flex rounded-xl shadow-sm">
          <div className={`w-full md:w-1/3 border-r ${selectedMessageId ? 'hidden md:block' : ''}`}>
            <div className="p-4 bg-white/80 border-b">
              <h2 className="text-lg font-semibold">Conversations</h2>
            </div>
            <MessageList
              messages={conversations.map(conv => ({
                id: conv.id,
                sender: 'Patient',
                senderRole: 'patient' as const,
                preview: 'Click to view messages',
                timestamp: new Date(conv.last_message_at),
                unread: false
              }))}
              selectedId={selectedMessageId}
              onSelectMessage={handleSelectMessage}
            />
          </div>
          
          <div className={`w-full md:w-2/3 ${selectedMessageId ? 'block' : 'hidden md:block'}`}>
            <MessageDetail
              conversation={selectedConversation ? {
                id: selectedConversation.id,
                participant: {
                  id: selectedConversation.participant_1_id,
                  name: 'Patient',
                  role: 'patient' as const,
                  avatar: '/placeholder-avatar.jpg'
                },
                messages: messages.map(msg => ({
                  id: msg.id,
                  content: msg.content,
                  timestamp: new Date(msg.created_at),
                  senderId: msg.sender_id,
                  senderName: msg.sender_id === 'current-doctor-id' ? 'You' : 'Patient',
                  senderRole: msg.sender_type as 'patient' | 'doctor' || 'patient',
                  status: 'read' as const
                })),
                unreadCount: 0
              } : null}
              currentUserId="current-doctor-id"
              currentUserRole="doctor"
              onBack={() => setSelectedMessageId(undefined)}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorMessages;
