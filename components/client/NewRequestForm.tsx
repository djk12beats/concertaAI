
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { createRequest } from '../../services/mockApi';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const NewRequestForm: React.FC<Props> = ({ onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Baixa' | 'Média' | 'Alta'>('Média');
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (filesArray.length > 5) {
        setError("Você pode enviar no máximo 5 imagens.");
        return;
      }
      for (const file of filesArray) {
        if (!['image/jpeg', 'image/png'].includes((file as File).type)) {
          setError('Apenas arquivos JPG e PNG são permitidos.');
          return;
        }
        if ((file as File).size > 5 * 1024 * 1024) { // 5MB
          setError('Cada arquivo deve ter no máximo 5MB.');
          return;
        }
      }

      // Cleanup old previews to avoid memory leaks
      previews.forEach(url => URL.revokeObjectURL(url));

      setPhotos(filesArray);
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
      setError('');
    }
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('A descrição é obrigatória.');
      return;
    }
    if (!currentUser) {
      setError('Você precisa estar logado.');
      return;
    }

    setLoading(true);
    setError('');

    const photoUrls = await Promise.all(photos.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.readAsDataURL(file);
      });
    }));

    try {
      await createRequest({
        clientId: currentUser.id,
        description,
        priority,
        photos: photoUrls,
      });

      // Cleanup
      previews.forEach(url => URL.revokeObjectURL(url));
      onSuccess();
    } catch (err) {
      setError('Falha ao criar a solicitação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30 px-4">
      <div className="bg-surface p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto">
        <h3 className="text-xl sm:text-2xl font-bold text-primary mb-4 sm:mb-6">Nova Solicitação de Serviço</h3>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="description" className="block text-[10px] font-black text-primary/30 uppercase tracking-widest mb-1.5">
              Descreva o problema
            </label>
            <textarea
              id="description"
              rows={3}
              className="mt-1 block w-full rounded-xl border-secondary shadow-sm focus:border-accent focus:ring-accent text-sm sm:text-base bg-input-bg p-3 sm:p-4 border"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva detalhadamente o que precisa ser consertado..."
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label htmlFor="priority" className="block text-[10px] font-black text-primary/30 uppercase tracking-widest mb-1.5">
                Prioridade
              </label>
              <select
                id="priority"
                className="mt-1 block w-full rounded-xl border-secondary shadow-sm focus:border-accent focus:ring-accent text-sm sm:text-base bg-input-bg p-3 border appearance-none"
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'Baixa' | 'Média' | 'Alta')}
              >
                <option>Baixa</option>
                <option>Média</option>
                <option>Alta</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-primary/30 uppercase tracking-widest mb-1.5">
                Fotos (máx 5)
              </label>
              <div className="mt-1 flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-20 sm:h-24 border-2 border-secondary border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-2 pb-2">
                    <svg className="w-5 h-5 mb-1 text-primary/40" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                    </svg>
                    <p className="text-[10px] text-primary/60"><span className="font-semibold">Clique</span> ou arraste</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/png, image/jpeg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {previews.length > 0 && (
            <div className="grid grid-cols-5 gap-2">
              {previews.map((src, idx) => (
                <div key={idx} className="relative group rounded-lg overflow-hidden border-2 border-secondary bg-slate-100 aspect-square">
                  <img src={src} alt={`preview ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-lg">{error}</p>}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-sm font-bold bg-secondary text-primary rounded-xl hover:bg-opacity-80 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 text-sm bg-primary text-white rounded-xl hover:bg-slate-800 transition-all shadow-md disabled:bg-primary/40 font-bold"
            >
              {loading ? 'Enviando...' : 'Criar Solicitação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewRequestForm;
