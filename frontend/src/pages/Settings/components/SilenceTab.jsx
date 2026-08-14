import React from 'react';
import { Moon, Clock } from 'lucide-react';

const SilenceTab = ({ configs, setConfigs }) => {
    return (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ 
                background: 'rgba(16, 185, 129, 0.08)', 
                padding: '1.25rem', 
                borderRadius: '12px', 
                border: '1px solid rgba(16, 185, 129, 0.2)',
                display: 'flex',
                gap: '15px',
                alignItems: 'flex-start'
            }}>
                <div style={{ 
                    width: '38px', height: '38px', borderRadius: '10px', 
                    background: 'rgba(16, 185, 129, 0.15)', color: '#10b981',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                    <Moon size={20} />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#10b981' }}>Regra do Horário de Silêncio</h4>
                        <button 
                            type="button"
                            onClick={() => setConfigs({ ...configs, SILENCE_HOURS_ENABLED: configs.SILENCE_HOURS_ENABLED === 'true' ? 'false' : 'true' })}
                            style={{ 
                                padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700,
                                background: configs.SILENCE_HOURS_ENABLED === 'true' ? '#10b981' : 'rgba(255,255,255,0.05)',
                                color: configs.SILENCE_HOURS_ENABLED === 'true' ? '#fff' : 'var(--text-dim)',
                                border: '1px solid ' + (configs.SILENCE_HOURS_ENABLED === 'true' ? '#10b981' : 'var(--border)'),
                                cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >
                            {configs.SILENCE_HOURS_ENABLED === 'true' ? '✓ Ativado' : '✕ Desativado'}
                        </button>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: '1.5', margin: 0 }}>
                        Quando ativado, os disparos automáticos nos grupos serão pausados durante o período de descanso especificado.
                    </p>
                </div>
            </div>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '1.5rem', 
                opacity: configs.SILENCE_HOURS_ENABLED === 'true' ? 1 : 0.4,
                pointerEvents: configs.SILENCE_HOURS_ENABLED === 'true' ? 'auto' : 'none',
                transition: 'opacity 0.2s'
            }}>
                <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <Clock size={14} /> Início do Silêncio (Pausa)
                    </label>
                    <input 
                        type="time" 
                        className="premium-field"
                        style={{ width: '100%', height: '48px', fontSize: '1rem', padding: '0 1rem' }}
                        value={configs.SILENCE_HOURS_START || '22:00'}
                        onChange={e => setConfigs({...configs, SILENCE_HOURS_START: e.target.value})}
                    />
                </div>
                <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <Clock size={14} /> Fim do Silêncio (Retomada)
                    </label>
                    <input 
                        type="time" 
                        className="premium-field"
                        style={{ width: '100%', height: '48px', fontSize: '1rem', padding: '0 1rem' }}
                        value={configs.SILENCE_HOURS_END || '08:00'}
                        onChange={e => setConfigs({...configs, SILENCE_HOURS_END: e.target.value})}
                    />
                </div>
            </div>
        </div>
    );
};

export default SilenceTab;
