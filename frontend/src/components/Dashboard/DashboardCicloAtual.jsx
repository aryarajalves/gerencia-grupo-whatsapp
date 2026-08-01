import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronUp, Search, ExternalLink } from 'lucide-react';

const DashboardCicloAtual = ({
  grupos_por_dia = [],
  selectedGroupJid,
  setSelectedGroupJid,
  grupos = []
}) => {
  const [diaExpandido, setDiaExpandido] = useState(null);
  const [buscaGrupo, setBuscaGrupo] = useState('');

  const toggleDia = (dia) => {
    if (diaExpandido === dia) {
      setDiaExpandido(null);
      setBuscaGrupo('');
    } else {
      setDiaExpandido(dia);
      setBuscaGrupo('');
    }
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', flex: 1 }}>
      {/* Header do Card */}
      <div style={{
        padding: '1rem 1.25rem',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(255,255,255,0.015)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: 'rgba(124,58,237,0.12)',
            border: '1px solid rgba(124,58,237,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Layers size={14} style={{ color: 'var(--accent)' }} />
          </div>
          <h3 style={{ margin: 0, fontSize: '0.95rem' }}>Ciclo Atual</h3>
        </div>
        {grupos_por_dia.length > 0 && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>
            {grupos_por_dia.length} dia(s) ativo(s)
          </span>
        )}
      </div>

      {/* Lista Compacta de Dias de Ciclo */}
      <div style={{ padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {grupos_por_dia.length > 0 ? (
          grupos_por_dia.map((item) => {
            const totalGrupos = item.grupos.length;
            const isExpanded = diaExpandido === item.dia;

            // Filtrar grupos do dia pela busca interna
            const gruposFiltrados = item.grupos.filter(nome =>
              nome.toLowerCase().includes(buscaGrupo.toLowerCase())
            );

            return (
              <div
                key={item.dia}
                style={{
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border)',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s'
                }}
              >
                {/* Linha Compacta Resumo do Dia */}
                <div
                  onClick={() => toggleDia(item.dia)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    background: isExpanded ? 'rgba(16,185,129,0.04)' : 'transparent'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      padding: '3px 9px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      background: 'rgba(16,185,129,0.12)',
                      color: '#10b981',
                      border: '1px solid rgba(16,185,129,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981' }} />
                      DIA {item.dia}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                      {totalGrupos} grupo(s)
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 700 }}>
                      {isExpanded ? 'Ocultar' : 'Ver Grupos'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp size={15} style={{ color: 'var(--primary)' }} />
                    ) : (
                      <ChevronDown size={15} style={{ color: 'var(--text-dim)' }} />
                    )}
                  </div>
                </div>

                {/* Painel Expansível dos Grupos do Dia */}
                {isExpanded && (
                  <div style={{
                    padding: '10px 12px 12px 12px',
                    borderTop: '1px solid var(--border)',
                    background: 'rgba(0,0,0,0.2)'
                  }}>
                    {totalGrupos > 5 && (
                      <div style={{ position: 'relative', marginBottom: '8px' }}>
                        <Search size={13} style={{ position: 'absolute', left: '10px', top: '8px', color: 'var(--text-dim)' }} />
                        <input
                          type="text"
                          placeholder={`Buscar no Dia ${item.dia}...`}
                          value={buscaGrupo}
                          onChange={(e) => setBuscaGrupo(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '4px 10px 4px 30px',
                            borderRadius: '6px',
                            background: 'rgba(15, 23, 42, 0.7)',
                            border: '1px solid var(--border)',
                            color: '#fff',
                            fontSize: '0.75rem'
                          }}
                        />
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '5px',
                      maxHeight: '180px',
                      overflowY: 'auto',
                      paddingRight: '2px'
                    }}>
                      {gruposFiltrados.map((nome, j) => {
                        const gMatch = grupos.find(g => g.nome === nome);
                        const isSelected = gMatch && gMatch.id_do_grupo === selectedGroupJid;

                        return (
                          <button
                            key={j}
                            onClick={() => gMatch && setSelectedGroupJid(gMatch.id_do_grupo)}
                            title={gMatch ? 'Clique para filtrar o Dashboard neste grupo' : ''}
                            style={{
                              fontSize: '0.72rem',
                              padding: '3px 9px',
                              borderRadius: '6px',
                              background: isSelected ? 'rgba(37,99,235,0.3)' : 'rgba(37,99,235,0.1)',
                              color: isSelected ? '#fff' : 'var(--primary)',
                              border: isSelected ? '1px solid var(--primary)' : '1px solid rgba(37,99,235,0.2)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              cursor: 'pointer',
                              fontWeight: isSelected ? 700 : 500
                            }}
                          >
                            <span>{nome}</span>
                            <ExternalLink size={9} style={{ opacity: 0.7 }} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
            Nenhum grupo em ciclo ativo.
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCicloAtual;
