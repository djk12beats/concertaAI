
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ChatMessage, Role } from '../../types';
import { getChatMessages, sendChatMessage } from '../../services/mockApi';
import { SendIcon } from './Icons';

interface Props {
  requestId: number;
}

const Chat: React.FC<Props> = ({ requestId }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      const data = await getChatMessages(requestId);
      setMessages(data);
      setLoading(false);
    };
    fetchMessages();
  }, [requestId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !currentUser) return;

    const optimisticMessage: ChatMessage = {
      id: Date.now(),
      requestId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      message: newMessage,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');

    await sendChatMessage(requestId, currentUser.id, newMessage);
    const updatedMessages = await getChatMessages(requestId);
    setMessages(updatedMessages);
  };

  if (loading) return <div className="flex-grow flex items-center justify-center text-primary/30 font-black uppercase text-[10px] tracking-widest">Carregando chat...</div>

  return (
    <div className="bg-surface border border-secondary/50 rounded-[2rem] flex flex-col h-full shadow-inner overflow-hidden">
      <div className="p-2 border-b border-secondary/30 bg-slate-50/50">
        <h4 className="font-black text-[9px] text-primary/30 uppercase tracking-[0.2em] text-center">Chat</h4>
      </div>
      <div className="flex-grow p-3 space-y-3 overflow-y-auto scrollbar-hide bg-slate-50/20">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-center text-[10px] font-black text-primary/20 uppercase tracking-widest">Inicie a conversa</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.senderId === currentUser?.id ? 'items-end' : 'items-start'
                }`}
            >
              <div
                className={`max-w-[90%] sm:max-w-[80%] px-3 py-2 rounded-xl shadow-sm ${msg.senderId === currentUser?.id
                  ? 'bg-primary text-white'
                  : 'bg-white text-primary border border-secondary'
                  }`}
              >
                <p className="text-sm leading-tight">{msg.message}</p>
              </div>
              <span className="text-[8px] font-black text-primary/30 mt-0.5 uppercase tracking-tighter">
                {msg.senderRole === Role.ADMIN ? 'ADMIN' : msg.senderName.split(' ')[0]} • {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-2 border-t border-secondary/30 bg-white">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Mensagem..."
            className="flex-grow p-2.5 bg-secondary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 border-transparent text-sm font-medium"
          />
          <button
            type="submit"
            className="p-2.5 bg-primary text-white rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-30 shadow-lg"
            disabled={!newMessage.trim()}
          >
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
