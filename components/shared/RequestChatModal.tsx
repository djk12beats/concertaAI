
import React from 'react';
import Chat from './Chat';

interface Props {
  requestId: number;
  clientName: string;
  onClose: () => void;
}

const RequestChatModal: React.FC<Props> = ({ requestId, clientName, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40" onClick={onClose}>
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-lg h-[70vh] flex flex-col m-4" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b flex justify-between items-center bg-surface rounded-t-xl">
            <h3 className="text-lg font-bold text-primary">Chat com {clientName.split(' ')[0]}</h3>
            <button onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-800">&times;</button>
        </div>
        <div className="flex-grow p-1 sm:p-2 bg-surface overflow-hidden">
            <Chat requestId={requestId} />
        </div>
      </div>
    </div>
  );
};

export default RequestChatModal;
