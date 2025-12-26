
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { updateUser } from '../../services/mockApi';

interface Props {
  onClose: () => void;
}

const SettingsModal: React.FC<Props> = ({ onClose }) => {
  const { currentUser, updateCurrentUser } = useAuth();
  
  const [name, setName] = useState(currentUser?.name || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updatedData = { name, address, phone };
      const updatedUser = await updateUser(currentUser.id, updatedData);
      if (updatedUser) {
        updateCurrentUser(updatedUser);
        setSuccess('Dados atualizados com sucesso!');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        throw new Error('Usuário não encontrado.');
      }
    } catch (err) {
      setError('Falha ao atualizar os dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
      <div className="bg-surface p-8 rounded-xl shadow-2xl w-full max-w-lg m-4">
        <h3 className="text-xl font-bold text-primary mb-6">Minhas Configurações</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-primary/90">
              Nome Completo
            </label>
            <input
              id="name"
              type="text"
              className="mt-1 block w-full rounded-md border-secondary shadow-sm focus:border-accent focus:ring-accent sm:text-sm bg-input-bg p-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-primary/90">
              Endereço
            </label>
            <input
              id="address"
              type="text"
              className="mt-1 block w-full rounded-md border-secondary shadow-sm focus:border-accent focus:ring-accent sm:text-sm bg-input-bg p-2"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-primary/90">
              Telefone
            </label>
            <input
              id="phone"
              type="tel"
              className="mt-1 block w-full rounded-md border-secondary shadow-sm focus:border-accent focus:ring-accent sm:text-sm bg-input-bg p-2"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-secondary text-primary rounded-lg hover:bg-opacity-80 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:bg-primary/40"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;