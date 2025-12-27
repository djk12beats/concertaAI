
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ChatMessage, User, Role } from '../../types';
import { getAdminChatMessages, sendAdminChatMessage } from '../../services/mockApi';
import { SendIcon } from '../shared/Icons';

interface Props {
  user: User;
  onClose: () => void;
}

const AdminChatModal: React.FC<Props> = ({ user, onClose }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentUser) return;
      setLoading(true);
      const data = await getAdminChatMessages(currentUser.id, user.id);
      setMessages(data);
      setLoading(false);
    };
    fetchMessages();
  }, [currentUser, user.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !currentUser) return;

    const optimisticMessage: ChatMessage = {
      id: Date.now(),
      requestId: 0,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      message: newMessage,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');

    await sendAdminChatMessage(currentUser.id, user.id, newMessage);

    const updatedMessages = await getAdminChatMessages(currentUser.id, user.id);
    setMessages(updatedMessages);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40" onClick={onClose}>
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-lg h-[70vh] flex flex-col m-4" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b flex justify-between items-center bg-surface rounded-t-xl">
          <h3 className="text-lg font-bold text-primary">Chat com {user.name.split(' ')[0]}</h3>
          <button onClick={onClose} className="text-2xl text-primary/60 hover:text-primary">&times;</button>
        </div>

        <div className="flex-grow p-4 space-y-4 overflow-y-auto bg-surface">
          {loading ? (
            <div className="flex-grow flex items-center justify-center text-primary/70">Carregando chat...</div>
          ) : messages.length === 0 ? (
            <p className="text-center text-sm text-primary/50">Inicie a conversa com {user.name}.</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.senderId === currentUser?.id ? 'items-end' : 'items-start'
                  }`}
              >
                <div
                  className={`max-w-xs md:max-w-sm px-4 py-2 rounded-xl ${msg.senderId === currentUser?.id
                    ? 'bg-accent text-white'
                    : 'bg-secondary text-primary'
                    }`}
                >
                  <p className="text-sm">{msg.message}</p>
                </div>
                <span className="text-xs text-primary/50 mt-1">
                  {msg.senderRole === Role.ADMIN ? 'ADMIN' : msg.senderName.split(' ')[0]} - {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-2 border-t bg-surface rounded-b-xl">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite uma mensagem..."
              className="flex-grow p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent bg-input-bg"
            />
            <button
              type="submit"
              className="p-3 bg-primary text-white rounded-lg hover:bg-opacity-90 disabled:bg-primary/40"
              disabled={!newMessage.trim()}
            >
              <SendIcon />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminChatModal;