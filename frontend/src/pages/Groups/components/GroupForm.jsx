import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, CalendarDays, PlusCircle, Pencil, RefreshCw, 
  ShieldCheck, Settings, Ghost 
} from 'lucide-react';

import GeneralTab from './tabs/GeneralTab';
import CycleTab from './tabs/CycleTab';
import ExtractionTab from './tabs/ExtractionTab';
import SecurityTab from './tabs/SecurityTab';
import GhostTab from './tabs/GhostTab';

const GroupForm = ({ 
  novoGrupo, 
  setNovoGrupo, 
  onSubmit, 
  onCancel, 
  editingId, 
  processing, 
  wapiGrupos, 
  wapiLoading, 
  wapiErro 
}) => {
  const [activeTab, setActiveTab] = useState('geral'); // 'geral' | 'ciclo' | 'extracao' | 'seguranca' | 'ghost'
  const [jidSearch, setJidSearch] = useState('');
  const [jidDropdownOpen, setJidDropdownOpen] = useState(false);
  const [jidDropdownRect, setJidDropdownRect] = useState(null);
  const [admInput, setAdmInput] = useState('');
  const jidInputWrapRef = useRef(null);
  const jidRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { 
      if (jidRef.current && !jidRef.current.contains(e.target)) {
        setJidDropdownOpen(false); 
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const wapiGruposFiltrados = (wapiGrupos || []).filter(g =>
    g.nome.toLowerCase().includes(jidSearch.toLowerCase()) ||
    g.jid.toLowerCase().includes(jidSearch.toLowerCase())
  );

  const getGroupInitials = (name) => name ? name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() : '?';

  // Manipulação de Badges para a Lista de Segurança de Administradores
  const admsList = (novoGrupo.adms_permitidos || '')
    .split(',')
    .map(s => s.trim().replace(/\D/g, ''))
    .filter(Boolean);

  const addAdmBadge = (valueToAdd) => {
    const val = valueToAdd.replace(/\D/g, '').trim();
    if (!val) return;
    if (!admsList.includes(val)) {
      const newList = [...admsList, val].join(', ');
      setNovoGrupo({ ...novoGrupo, adms_permitidos: newList, seguranca_adms_ativa: true });
    }
    setAdmInput('');
  };

  const removeAdmBadge = (indexToRemove) => {
    const newList = admsList.filter((_, i) => i !== indexToRemove).join(', ');
    setNovoGrupo({ ...novoGrupo, adms_permitidos: newList });
  };

  const handleAdmKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addAdmBadge(admInput);
    } else if (e.key === 'Backspace' && !admInput && admsList.length > 0) {
      removeAdmBadge(admsList.length - 1);
    }
  };

  const handleAdmBlur = () => {
    if (admInput.trim()) {
      addAdmBadge(admInput);
    }
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'visible', marginBottom: '1.5rem', border: editingId ? '1px solid rgba(245,158,11,0.35)' : '1px solid var(--border)' }}>
      {/* Header do Card */}
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', background: editingId ? 'linear-gradient(90deg, rgba(245,158,11,0.08), transparent)' : 'linear-gradient(90deg, rgba(37,99,235,0.06), transparent)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {editingId ? (
            <>
              <Pencil size={15} style={{ color: '#f59e0b' }} />
              <span style={{ fontWeight: 600, color: '#f59e0b' }}>Editando Grupo: {novoGrupo.nome || ''}</span>
            </>
          ) : (
            <>
              <PlusCircle size={15} style={{ color: 'var(--primary)' }} />
              <span style={{ fontWeight: 600 }}>Cadastrar Novo Grupo de Lançamento</span>
            </>
          )}
        </div>
      </div>

      {/* Barra de Abas (Tabs) */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '4px', 
        padding: '0.5rem 1.5rem 0', 
        borderBottom: '1px solid var(--border)', 
        background: 'rgba(0,0,0,0.15)',
        overflowX: 'auto'
      }}>
        {/* Aba 1: Dados Gerais */}
        <button
          type="button"
          onClick={() => setActiveTab('geral')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '0.85rem', fontWeight: 600,
            cursor: 'pointer', border: 'none', background: 'transparent',
            color: activeTab === 'geral' ? '#fff' : 'var(--text-dim)',
            borderBottom: activeTab === 'geral' ? '2px solid var(--primary)' : '2px solid transparent',
            transition: 'all 0.2s', whiteSpace: 'nowrap'
          }}
        >
          <Settings size={14} style={{ color: activeTab === 'geral' ? 'var(--primary)' : 'inherit' }} />
          Dados Gerais
        </button>

        {/* Aba 2: Ciclo & Disparos */}
        <button
          type="button"
          onClick={() => setActiveTab('ciclo')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '0.85rem', fontWeight: 600,
            cursor: 'pointer', border: 'none', background: 'transparent',
            color: activeTab === 'ciclo' ? '#fff' : 'var(--text-dim)',
            borderBottom: activeTab === 'ciclo' ? '2px solid #f59e0b' : '2px solid transparent',
            transition: 'all 0.2s', whiteSpace: 'nowrap'
          }}
        >
          <CalendarDays size={14} style={{ color: activeTab === 'ciclo' ? '#f59e0b' : 'inherit' }} />
          Ciclo & Disparos
        </button>

        {/* Aba 3: Extração de Leads */}
        <button
          type="button"
          onClick={() => setActiveTab('extracao')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '0.85rem', fontWeight: 600,
            cursor: 'pointer', border: 'none', background: 'transparent',
            color: activeTab === 'extracao' ? '#fff' : 'var(--text-dim)',
            borderBottom: activeTab === 'extracao' ? '2px solid #22c55e' : '2px solid transparent',
            transition: 'all 0.2s', whiteSpace: 'nowrap'
          }}
        >
          <Users size={14} style={{ color: activeTab === 'extracao' ? '#22c55e' : 'inherit' }} />
          Extração de Leads
          {novoGrupo.extrair_contatos !== false && (
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
          )}
        </button>

        {/* Aba 4: Segurança de Admins */}
        <button
          type="button"
          onClick={() => setActiveTab('seguranca')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '0.85rem', fontWeight: 600,
            cursor: 'pointer', border: 'none', background: 'transparent',
            color: activeTab === 'seguranca' ? '#fff' : 'var(--text-dim)',
            borderBottom: activeTab === 'seguranca' ? '2px solid #38bdf8' : '2px solid transparent',
            transition: 'all 0.2s', whiteSpace: 'nowrap'
          }}
        >
          <ShieldCheck size={14} style={{ color: activeTab === 'seguranca' ? '#38bdf8' : 'inherit' }} />
          Segurança de Admins
          {Boolean(novoGrupo.seguranca_adms_ativa) && (
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#38bdf8' }} />
          )}
        </button>

        {/* Aba 5: Número Fantasma */}
        <button
          type="button"
          onClick={() => setActiveTab('ghost')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '0.85rem', fontWeight: 600,
            cursor: 'pointer', border: 'none', background: 'transparent',
            color: activeTab === 'ghost' ? '#fff' : 'var(--text-dim)',
            borderBottom: activeTab === 'ghost' ? '2px solid #c084fc' : '2px solid transparent',
            transition: 'all 0.2s', whiteSpace: 'nowrap'
          }}
        >
          <Ghost size={14} style={{ color: activeTab === 'ghost' ? '#c084fc' : 'inherit' }} />
          Número Fantasma
          {Boolean(novoGrupo.numero_fantasma_ativo) && (
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c084fc' }} />
          )}
        </button>
      </div>

      <form onSubmit={onSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* ==================== ABA 1: DADOS GERAIS ==================== */}
        {activeTab === 'geral' && (
          <GeneralTab 
            novoGrupo={novoGrupo}
            setNovoGrupo={setNovoGrupo}
            jidRef={jidRef}
            jidInputWrapRef={jidInputWrapRef}
            jidDropdownOpen={jidDropdownOpen}
            setJidDropdownOpen={setJidDropdownOpen}
            jidSearch={jidSearch}
            setJidSearch={setJidSearch}
            jidDropdownRect={jidDropdownRect}
            setJidDropdownRect={setJidDropdownRect}
            wapiGrupos={wapiGrupos}
            wapiGruposFiltrados={wapiGruposFiltrados}
            wapiLoading={wapiLoading}
            getGroupInitials={getGroupInitials}
          />
        )}

        {/* ==================== ABA 2: CICLO & DISPAROS ==================== */}
        {activeTab === 'ciclo' && (
          <CycleTab 
            novoGrupo={novoGrupo}
            setNovoGrupo={setNovoGrupo}
          />
        )}

        {/* ==================== ABA 3: EXTRAÇÃO DE LEADS ==================== */}
        {activeTab === 'extracao' && (
          <ExtractionTab 
            novoGrupo={novoGrupo}
            setNovoGrupo={setNovoGrupo}
          />
        )}

        {/* ==================== ABA 4: SEGURANÇA DE ADMINS ==================== */}
        {activeTab === 'seguranca' && (
          <SecurityTab 
            novoGrupo={novoGrupo}
            setNovoGrupo={setNovoGrupo}
            admsList={admsList}
            admInput={admInput}
            setAdmInput={setAdmInput}
            handleAdmKeyDown={handleAdmKeyDown}
            handleAdmBlur={handleAdmBlur}
            removeAdmBadge={removeAdmBadge}
          />
        )}

        {/* ==================== ABA 5: NÚMERO FANTASMA ==================== */}
        {activeTab === 'ghost' && (
          <GhostTab 
            novoGrupo={novoGrupo}
            setNovoGrupo={setNovoGrupo}
          />
        )}

        {/* Rodapé de Ações do Formulário (Sempre Visível) */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '1rem', borderTop: '1px solid var(--border)', marginTop: '0.5rem' }}>
          {editingId && (
            <button type="button" onClick={onCancel} className="btn btn-secondary" style={{ height: '42px', padding: '0 20px' }}>
              Cancelar
            </button>
          )}
          <button className="btn btn-primary" type="submit" disabled={processing} style={{ height: '42px', minWidth: '160px', fontWeight: 600 }}>
            {processing ? <RefreshCw size={18} className="spin" /> : editingId ? 'Salvar Alterações' : 'Cadastrar Grupo'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default GroupForm;
