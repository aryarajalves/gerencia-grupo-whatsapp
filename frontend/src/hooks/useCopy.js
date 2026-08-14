import { useState } from 'react';
import toast from 'react-hot-toast';

export const useCopy = () => {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (text, id, customMessage = 'URL copiada para a área de transferência!') => {
    if (!text) return;
    
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(text);
      } else {
        // Fallback para navegadores legados
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      setCopiedId(id);
      toast.success(customMessage, {
        id: `copy-${id || 'default'}`,
        duration: 3000
      });
      
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
      toast.error('Erro ao copiar para a área de transferência');
    }
  };

  return { copiedId, handleCopy };
};
