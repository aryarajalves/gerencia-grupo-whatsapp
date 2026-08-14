import React from 'react';
import { CheckCircle2, Clock, Shield } from 'lucide-react';

const BackupSummaryCards = ({ info }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
      {/* Card 1: Último Backup */}
      <div className="glass-card" style={{ padding: '1.25rem', background: 'rgba(15, 18, 28, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <CheckCircle2 size={20} />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Último Backup
          </span>
        </div>

        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '4px' }}>
          {info?.ultimo_backup?.filename || 'Nenhum backup realizado'}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          {info?.ultimo_backup?.datetime || 'Realize o primeiro backup'}
        </div>
      </div>

      {/* Card 2: Próximo Backup */}
      <div className="glass-card" style={{ padding: '1.25rem', background: 'rgba(15, 18, 28, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <Clock size={20} />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Próximo Backup
          </span>
        </div>

        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
          {info?.agendamento_ativo ? (info?.proximo_backup?.datetime || '-') : 'Agendamento desativado'}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          {info?.agendamento_ativo ? `A cada ${info?.interval_hours || 6} hora(s)` : 'Ative o agendamento nas configurações'}
        </div>
      </div>

      {/* Card 3: Retenção */}
      <div className="glass-card" style={{ padding: '1.25rem', background: 'rgba(15, 18, 28, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
            <Shield size={20} />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Retenção
          </span>
        </div>

        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '2px' }}>
          {info?.retencao_count || 30}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          backups mantidos no S3
        </div>
      </div>
    </div>
  );
};

export default BackupSummaryCards;
