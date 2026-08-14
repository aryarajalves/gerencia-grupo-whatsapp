import React from 'react';
import { CalendarDays, Flag, Repeat, Sliders } from 'lucide-react';

const DIAS_SEMANA = [
  'Segunda-feira', 'Terça-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'
];

const CycleTab = ({ novoGrupo, setNovoGrupo }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.2s ease-in-out' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="label-premium"><CalendarDays size={12} /> Início do Ciclo</label>
          <select 
            value={novoGrupo.dia_inicio_semana ?? 0} 
            onChange={e => setNovoGrupo({ ...novoGrupo, dia_inicio_semana: parseInt(e.target.value) })} 
            style={{ width: '100%' }}
          >
            {DIAS_SEMANA.map((dia, index) => (
              <option key={index} value={index}>{dia}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="label-premium"><Flag size={12} /> Encerramento do Ciclo</label>
          <select 
            value={novoGrupo.dia_fim_semana ?? 4} 
            onChange={e => setNovoGrupo({ ...novoGrupo, dia_fim_semana: parseInt(e.target.value) })} 
            style={{ width: '100%' }}
          >
            {DIAS_SEMANA.map((dia, index) => (
              <option key={index} value={index}>{dia}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tipo de Ciclo */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="label-premium"><Repeat size={12} /> Tipo de Ciclo</label>
        <div style={{ display: 'flex', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1, padding: '10px 14px', borderRadius: '10px', border: `1px solid ${novoGrupo.tipo_ciclo !== 'unico' ? 'rgba(37,99,235,0.5)' : 'var(--border)'}`, background: novoGrupo.tipo_ciclo !== 'unico' ? 'rgba(37,99,235,0.08)' : 'transparent', transition: 'all 0.2s' }}>
            <input type="radio" name="tipo_ciclo" value="semanal" checked={novoGrupo.tipo_ciclo !== 'unico'} onChange={() => setNovoGrupo({ ...novoGrupo, tipo_ciclo: 'semanal' })} style={{ accentColor: 'var(--primary)' }} />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: novoGrupo.tipo_ciclo !== 'unico' ? 'var(--primary)' : 'var(--text)' }}>Semanal (Recorrente)</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>Reinicia no início toda semana</div>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1, padding: '10px 14px', borderRadius: '10px', border: `1px solid ${novoGrupo.tipo_ciclo === 'unico' ? 'rgba(245,158,11,0.5)' : 'var(--border)'}`, background: novoGrupo.tipo_ciclo === 'unico' ? 'rgba(245,158,11,0.08)' : 'transparent', transition: 'all 0.2s' }}>
            <input type="radio" name="tipo_ciclo" value="unico" checked={novoGrupo.tipo_ciclo === 'unico'} onChange={() => setNovoGrupo({ ...novoGrupo, tipo_ciclo: 'unico' })} style={{ accentColor: '#f59e0b' }} />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: novoGrupo.tipo_ciclo === 'unico' ? '#f59e0b' : 'var(--text)' }}>Único (Sem repetição)</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>Para após o encerramento</div>
            </div>
          </label>
        </div>
      </div>

      {/* Simular Digitando */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="label-premium">
          <Sliders size={12} /> Simular "Digitando..." antes de enviar
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="range"
            min={0}
            max={60}
            step={1}
            value={novoGrupo.tempo_digitando_segundos || 0}
            onChange={e => setNovoGrupo({ ...novoGrupo, tempo_digitando_segundos: parseInt(e.target.value) || 0 })}
            style={{ flex: 1, accentColor: 'var(--primary)', cursor: 'pointer' }}
          />
          <div style={{
            minWidth: '70px',
            textAlign: 'center',
            padding: '6px 12px',
            borderRadius: '8px',
            background: (novoGrupo.tempo_digitando_segundos || 0) > 0 ? 'rgba(37,99,235,0.15)' : 'rgba(255,255,255,0.05)',
            border: (novoGrupo.tempo_digitando_segundos || 0) > 0 ? '1px solid rgba(37,99,235,0.3)' : '1px solid var(--border)',
            color: (novoGrupo.tempo_digitando_segundos || 0) > 0 ? 'var(--primary)' : 'var(--text-dim)',
            fontWeight: 600,
            fontSize: '0.85rem'
          }}>
            {(novoGrupo.tempo_digitando_segundos || 0) > 0 ? `${novoGrupo.tempo_digitando_segundos}s` : 'Desativado'}
          </div>
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
          {(novoGrupo.tempo_digitando_segundos || 0) > 0
            ? `O bot exibirá o status "digitando..." por ${novoGrupo.tempo_digitando_segundos} segundo(s) no WhatsApp antes de disparar cada mensagem.`
            : 'Nenhuma simulação de digitação. As mensagens serão enviadas imediatamente.'
          }
        </p>
      </div>
    </div>
  );
};

export default CycleTab;
