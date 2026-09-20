import React, { useState, useEffect } from 'react';
import { Vote } from 'lucide-react';
import axiosInstance from '../../../../services/api';
import { toast } from 'react-hot-toast';
import PollScopeSelector from './poll/PollScopeSelector';
import PollSelectionList from './poll/PollSelectionList';
import PollWebhookConfig from './poll/PollWebhookConfig';
import PollPayloadInfoCard from './poll/PollPayloadInfoCard';

const PollTab = ({ novoGrupo, setNovoGrupo }) => {
  const isAtivo = Boolean(novoGrupo.webhook_enquete_ativo);
  const isModoSelecionadas = (novoGrupo.webhook_enquete_modo === 'selecionadas');
  const [testing, setTesting] = useState(false);
  const [enquetesDisponiveis, setEnquetesDisponiveis] = useState([]);
  const [loadingEnquetes, setLoadingEnquetes] = useState(false);

  // Parse dos IDs selecionados (salvo como JSON array string ou string separada por vírgula)
  const getSelectedPollIds = () => {
    const raw = novoGrupo.webhook_enquete_ids;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try {
      if (typeof raw === 'string' && raw.startsWith('[')) {
        return JSON.parse(raw);
      }
      if (typeof raw === 'string') {
        return raw.split(',').map(s => s.trim()).filter(Boolean);
      }
    } catch {
      return [];
    }
    return [];
  };

  const selectedPollIds = getSelectedPollIds();

  // Busca as enquetes programadas cadastradas no sistema
  useEffect(() => {
    const fetchEnquetes = async () => {
      setLoadingEnquetes(true);
      try {
        const res = await axiosInstance.get('/mensagens/?tipo=enquete&limit=100');
        const msgs = res.data || [];
        const enquetes = msgs.filter(m => m.tipo_de_mensagem === 'enquete');
        setEnquetesDisponiveis(enquetes);
      } catch (err) {
        console.error('Erro ao buscar enquetes:', err);
      } finally {
        setLoadingEnquetes(false);
      }
    };
    fetchEnquetes();
  }, []);

  const togglePollSelection = (pollId) => {
    const strId = String(pollId);
    let updated;
    if (selectedPollIds.includes(strId)) {
      updated = selectedPollIds.filter(id => id !== strId);
    } else {
      updated = [...selectedPollIds, strId];
    }
    setNovoGrupo({
      ...novoGrupo,
      webhook_enquete_ids: JSON.stringify(updated)
    });
  };

  const handleSelectAll = () => {
    const allIds = enquetesDisponiveis.map(e => String(e.id));
    setNovoGrupo({
      ...novoGrupo,
      webhook_enquete_ids: JSON.stringify(allIds)
    });
  };

  const handleDeselectAll = () => {
    setNovoGrupo({
      ...novoGrupo,
      webhook_enquete_ids: JSON.stringify([])
    });
  };

  const handleTestWebhook = async () => {
    const url = (novoGrupo.webhook_enquete_url || '').trim();
    if (!url) {
      toast.error('Informe a URL do Webhook antes de realizar o teste.');
      return;
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      toast.error('A URL do Webhook deve iniciar com http:// ou https://');
      return;
    }

    setTesting(true);
    try {
      const res = await axiosInstance.post('/grupos/test-poll-webhook', {
        webhook_url: url,
        grupo_nome: novoGrupo.nome || 'WhatsApp - Teste - Astrologia',
        grupo_jid: novoGrupo.id_do_grupo || '120363405673797894@g.us'
      });
      toast.success(res.data.message || 'Webhook de teste enviado com sucesso!');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Erro ao conectar com o webhook.';
      toast.error(msg);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.2s ease-in-out' }}>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <label className="label-premium" style={{ margin: 0 }}>
            <Vote size={14} style={{ color: '#ec4899' }} /> Automação de Webhook para Enquetes
          </label>
        </div>

        {/* Seletor de Ativação/Desativação da Automação */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
          <label style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1, 
            padding: '12px 14px', borderRadius: '10px', 
            border: `1px solid ${isAtivo ? 'rgba(236, 72, 153, 0.5)' : 'var(--border)'}`, 
            background: isAtivo ? 'rgba(236, 72, 153, 0.08)' : 'transparent', 
            transition: 'all 0.2s' 
          }}>
            <input 
              type="radio" 
              name="webhook_enquete_ativo" 
              value="sim" 
              checked={isAtivo} 
              onChange={() => setNovoGrupo({ ...novoGrupo, webhook_enquete_ativo: true })} 
              style={{ accentColor: '#ec4899' }} 
            />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: isAtivo ? '#ec4899' : 'var(--text)' }}>
                Habilitada
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                Envia respostas de enquetes para o webhook
              </div>
            </div>
          </label>

          <label style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1, 
            padding: '12px 14px', borderRadius: '10px', 
            border: `1px solid ${!isAtivo ? 'rgba(148, 163, 184, 0.3)' : 'var(--border)'}`, 
            background: !isAtivo ? 'rgba(148, 163, 184, 0.05)' : 'transparent', 
            transition: 'all 0.2s' 
          }}>
            <input 
              type="radio" 
              name="webhook_enquete_ativo" 
              value="nao" 
              checked={!isAtivo} 
              onChange={() => setNovoGrupo({ ...novoGrupo, webhook_enquete_ativo: false })} 
              style={{ accentColor: '#94a3b8' }} 
            />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: !isAtivo ? '#94a3b8' : 'var(--text)' }}>
                Desabilitada
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                Não dispara eventos de enquete
              </div>
            </div>
          </label>
        </div>

        {/* Configurações quando habilitado */}
        {isAtivo && (
          <>
            {/* Seletor de Escopo */}
            <PollScopeSelector
              modo={novoGrupo.webhook_enquete_modo || 'todas'}
              onChange={modo => setNovoGrupo({ ...novoGrupo, webhook_enquete_modo: modo })}
            />

            {/* Lista de Seleção de Enquetes Específicas */}
            {isModoSelecionadas && (
              <PollSelectionList
                enquetesDisponiveis={enquetesDisponiveis}
                selectedPollIds={selectedPollIds}
                loadingEnquetes={loadingEnquetes}
                togglePollSelection={togglePollSelection}
                handleSelectAll={handleSelectAll}
                handleDeselectAll={handleDeselectAll}
              />
            )}

            {/* Configuração de URL e Delay */}
            <PollWebhookConfig
              webhookUrl={novoGrupo.webhook_enquete_url || ''}
              delaySegundos={novoGrupo.webhook_enquete_delay_segundos}
              onChangeUrl={url => setNovoGrupo({ ...novoGrupo, webhook_enquete_url: url })}
              onChangeDelay={delay => setNovoGrupo({ ...novoGrupo, webhook_enquete_delay_segundos: delay })}
              onTestWebhook={handleTestWebhook}
              testing={testing}
            />
          </>
        )}

        {/* Card Informativo do Payload Enviado */}
        <PollPayloadInfoCard />
      </div>
    </div>
  );
};

export default PollTab;
