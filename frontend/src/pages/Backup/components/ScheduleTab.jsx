import React from 'react';
import { Calendar, Settings, RefreshCw } from 'lucide-react';

const ScheduleTab = ({
  agendamentoAtivo,
  setAgendamentoAtivo,
  frequencyType,
  setFrequencyType,
  intervalValue,
  setIntervalValue,
  s3Folder,
  setS3Folder,
  retencaoCount,
  setRetencaoCount,
  handleSaveAllSettings,
  savingSettings
}) => {
  return (
    <div className="glass-card" style={{ padding: '1.75rem', background: 'rgba(15, 18, 28, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.2s ease-in-out' }}>
      <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Calendar size={22} style={{ color: '#a855f7' }} />
        Configurações de Agendamento Automático
      </h3>

      {/* Sub-card do Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255, 255, 255, 0.03)', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px', cursor: 'pointer', flexShrink: 0 }}>
          <input 
            type="checkbox" 
            checked={agendamentoAtivo}
            onChange={e => setAgendamentoAtivo(e.target.checked)}
            style={{ opacity: 0, width: 0, height: 0 }} 
          />
          <span style={{
            position: 'absolute', inset: 0,
            backgroundColor: agendamentoAtivo ? '#2563eb' : 'rgba(255,255,255,0.2)',
            borderRadius: '34px', transition: '0.3s'
          }}>
            <span style={{
              position: 'absolute', content: '""', height: '20px', width: '20px',
              left: agendamentoAtivo ? '26px' : '3px', bottom: '3px',
              backgroundColor: 'white', borderRadius: '50%', transition: '0.3s'
            }} />
          </span>
        </label>

        <div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
            {agendamentoAtivo ? 'Agendamento Automático Ativado' : 'Agendamento Automático Desativado'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            {agendamentoAtivo ? 'Os backups periódicos serão executados e enviados ao S3 conforme o intervalo abaixo.' : 'Nenhum backup automático será realizado.'}
          </div>
        </div>
      </div>

      {/* Linha 1: Frequência e Valor do Intervalo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Frequência do Intervalo</label>
          <select
            value={frequencyType}
            onChange={e => setFrequencyType(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          >
            <option value="hours" style={{ background: '#161822' }}>A cada X horas</option>
            <option value="days" style={{ background: '#161822' }}>A cada X dias</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Valor do Intervalo</label>
          <input 
            type="number"
            min="1"
            value={intervalValue}
            onChange={e => setIntervalValue(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '0.9rem',
              boxSizing: 'border-box'
            }}
          />
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Backup a cada <strong>{intervalValue || 6}</strong> {frequencyType === 'hours' ? 'hora(s)' : 'dia(s)'}
          </div>
        </div>
      </div>

      {/* Linha 2: Pasta do Backup no S3 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Pasta do Backup no S3</label>
        <input 
          type="text"
          value={s3Folder}
          onChange={e => setS3Folder(e.target.value)}
          placeholder="backups/"
          style={{
            width: '100%',
            padding: '10px 14px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '10px',
            color: '#fff',
            fontSize: '0.9rem',
            boxSizing: 'border-box'
          }}
        />
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          Subpasta onde os backups serão salvos no bucket do Backblaze S3. Ex: <code>backups/</code> ou <code>backups/cliente1/</code>.
        </div>
      </div>

      {/* Linha 3: Retenção */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Retenção — Máximo de Backups no S3</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <input 
            type="number"
            min="1"
            value={retencaoCount}
            onChange={e => setRetencaoCount(e.target.value)}
            style={{
              width: '100px',
              padding: '10px 14px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '0.9rem',
              textAlign: 'center'
            }}
          />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
            backups mantidos — os arquivos mais antigos serão excluídos automaticamente para economizar espaço.
          </span>
        </div>
      </div>

      {/* Botão Salvar Configuração */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
        <button
          onClick={handleSaveAllSettings}
          disabled={savingSettings}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '11px 26px',
            background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(147, 51, 234, 0.3)',
            transition: 'all 0.2s'
          }}
        >
          {savingSettings ? <RefreshCw size={18} className="animate-spin" /> : <Settings size={18} />}
          {savingSettings ? 'Salvando...' : 'Salvar Configuração'}
        </button>
      </div>
    </div>
  );
};

export default ScheduleTab;
