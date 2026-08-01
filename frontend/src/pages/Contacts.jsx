import React, { useState, useEffect } from 'react';
import { Users, Search, RefreshCcw, UserCircle, Download, ChevronDown, XCircle, CheckCircle2, Trash2, Upload } from 'lucide-react';
import axiosInstance from '../services/api';
import { toastDeletado, toastSucesso } from '../utils/toastNotifications';
import ImportContactsModal from './Contacts/components/ImportContactsModal';

const Contacts = ({ openConfirm }) => {
    const [contacts, setContacts] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [groupFilter, setGroupFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [totalContacts, setTotalContacts] = useState(0);
    const [stats, setStats] = useState({ total_contatos: 0, total_grupos: 0 });
    const [currentPage, setCurrentPage] = useState(1);
    const [resultsPerPage, setResultsPerPage] = useState(20);
    const [selectedIds, setSelectedIds] = useState([]);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        const pageIds = contacts.map(c => c.id);
        const allSelected = pageIds.length > 0 && pageIds.every(id => selectedIds.includes(id));
        if (allSelected) {
            setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
        }
    };

    const handleDeleteSingle = (contact) => {
        const doDelete = async () => {
            try {
                await axiosInstance.delete(`/contatos/${contact.id}`);
                toastDeletado('Contato Excluído', `O contato ${contact.nome || contact.numero} foi removido.`);
                setSelectedIds(prev => prev.filter(i => i !== contact.id));
                fetchContacts();
            } catch (err) {
                console.error('Erro ao excluir contato:', err);
            }
        };

        if (typeof openConfirm === 'function') {
            openConfirm('Excluir Contato', `Tem certeza que deseja remover o contato "${contact.nome || contact.numero}"?`, doDelete);
        } else if (window.confirm(`Tem certeza que deseja remover o contato ${contact.nome || contact.numero}?`)) {
            doDelete();
        }
    };

    const handleDeleteBatch = () => {
        if (selectedIds.length === 0) return;
        const doDeleteBatch = async () => {
            try {
                await axiosInstance.post('/contatos/batch-delete', { ids: selectedIds });
                toastDeletado('Contatos Excluídos', `${selectedIds.length} contato(s) foram removidos do sistema.`);
                setSelectedIds([]);
                fetchContacts();
            } catch (err) {
                console.error('Erro ao excluir lote de contatos:', err);
            }
        };

        if (typeof openConfirm === 'function') {
            openConfirm('Excluir Contatos Selecionados', `Deseja excluir definitivamente os ${selectedIds.length} contato(s) selecionados?`, doDeleteBatch);
        } else if (window.confirm(`Deseja excluir os ${selectedIds.length} contatos selecionados?`)) {
            doDeleteBatch();
        }
    };

    const fetchInitialData = async () => {
        try {
            const resGroups = await axiosInstance.get('/contatos/grupos');
            setGroups(resGroups.data);
        } catch (error) {
            console.error('Erro ao buscar grupos:', error);
        }
    };

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const params = {
                limit: resultsPerPage,
                skip: (currentPage - 1) * resultsPerPage,
                search: search || undefined,
                jid_grupo: groupFilter || undefined,
                no_grupo: statusFilter === 'all' ? undefined : (statusFilter === 'in')
            };
            const [res, resStats] = await Promise.all([
                axiosInstance.get('/contatos/', { params }),
                axiosInstance.get('/contatos/stats')
            ]);
            setContacts(res.data.items);
            setTotalContacts(res.data.total);
            setStats(resStats.data);
        } catch (error) {
            console.error('Erro ao buscar contatos:', error);
            showToast('Erro ao carregar contatos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = async () => {
        setExporting(true);
        try {
            const params = {
                search: search || undefined,
                jid_grupo: groupFilter || undefined,
                no_grupo: statusFilter === 'all' ? undefined : (statusFilter === 'in')
            };
            const response = await axiosInstance.get('/contatos/export', { 
                params, 
                responseType: 'blob' 
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `contatos_${new Date().getTime()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            showToast('Exportação concluída!', 'success');
        } catch (error) {
            console.error('Erro ao exportar CSV:', error);
            showToast('Erro na exportação', 'error');
        } finally {
            setExporting(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
        const handleConfigUpdated = () => {
            fetchInitialData();
            fetchContacts();
        };
        window.addEventListener('config-updated', handleConfigUpdated);
        return () => window.removeEventListener('config-updated', handleConfigUpdated);
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setCurrentPage(1);
            fetchContacts();
        }, 500);
        return () => clearTimeout(timeout);
    }, [search, groupFilter, statusFilter, resultsPerPage]);

    useEffect(() => {
        fetchContacts();
    }, [currentPage]);

    const totalPages = Math.ceil(totalContacts / resultsPerPage);

    return (
        <div className="fade-in">
            {/* Header and Stats */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(var(--primary-rgb), 0.15)', border: '1px solid rgba(var(--primary-rgb), 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={19} style={{ color: 'var(--primary)' }} />
                        </div>
                        <h1 style={{ margin: 0 }}>Gestão de Contatos</h1>
                    </div>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', marginLeft: '52px' }}>Visualização e exportação de leads extraídos dos grupos.</p>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.2)', textAlign: 'right' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px' }}>Total de Leads</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>{stats.total_contatos}</div>
                    </div>
                    <div style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.2)', textAlign: 'right' }}>
                        <div style={{ fontSize: '0.65rem', color: '#8b5cf6', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px' }}>Grupos Mapeados</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#8b5cf6' }}>{stats.total_grupos}</div>
                    </div>
                </div>
            </div>

            {/* Filter and Actions */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                        <input 
                            type="text" 
                            placeholder="Buscar por nome ou número..." 
                            style={{ paddingLeft: '38px', height: '42px', width: '100%' }}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '4px 12px', borderRadius: '10px', border: '1px solid var(--border)', minWidth: '180px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>Grupo:</span>
                        <select 
                            value={groupFilter}
                            onChange={(e) => setGroupFilter(e.target.value)}
                            style={{ 
                                background: 'transparent', border: 'none', color: '#fff', fontSize: '0.85rem', 
                                fontWeight: 600, cursor: 'pointer', outline: 'none', padding: '4px', width: '100%'
                            }}
                        >
                            <option value="" style={{ background: '#1c1e26' }}>Todos os Grupos</option>
                            {groups.map(g => (
                                <option key={g.jid_grupo} value={g.jid_grupo} style={{ background: '#1c1e26' }}>{g.nome_grupo}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '4px 12px', borderRadius: '10px', border: '1px solid var(--border)', minWidth: '160px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>Status:</span>
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ 
                                background: 'transparent', border: 'none', color: '#fff', fontSize: '0.85rem', 
                                fontWeight: 600, cursor: 'pointer', outline: 'none', padding: '4px', width: '100%'
                            }}
                        >
                            <option value="all" style={{ background: '#1c1e26' }}>Todos</option>
                            <option value="in" style={{ background: '#1c1e26' }}>No Grupo</option>
                            <option value="out" style={{ background: '#1c1e26' }}>Saiu do Grupo</option>
                        </select>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '4px 12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>Exibir:</span>
                        <select 
                            value={resultsPerPage}
                            onChange={(e) => {
                                setResultsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            style={{ 
                                background: 'transparent', border: 'none', color: '#fff', fontSize: '0.85rem', 
                                fontWeight: 600, cursor: 'pointer', outline: 'none', padding: '4px'
                            }}
                        >
                            <option value={20} style={{ background: '#1c1e26' }}>20</option>
                            <option value={50} style={{ background: '#1c1e26' }}>50</option>
                            <option value={100} style={{ background: '#1c1e26' }}>100</option>
                            <option value={200} style={{ background: '#1c1e26' }}>200</option>
                            <option value={500} style={{ background: '#1c1e26' }}>500</option>
                        </select>
                    </div>

                    {selectedIds.length > 0 && (
                        <button 
                            className="btn" 
                            style={{ height: '42px', gap: '8px', padding: '0 1.25rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444' }}
                            onClick={handleDeleteBatch}
                        >
                            <Trash2 size={16} />
                            Excluir Selecionados ({selectedIds.length})
                        </button>
                    )}

                    <button 
                        className="btn btn-secondary" 
                        style={{ height: '42px', gap: '8px', padding: '0 1.25rem' }}
                        onClick={() => setIsImportModalOpen(true)}
                    >
                        <Upload size={16} />
                        Importar Contatos
                    </button>

                    <button 
                        className="btn btn-secondary" 
                        style={{ height: '42px', gap: '8px', padding: '0 1.25rem' }}
                        onClick={handleExportCSV}
                        disabled={exporting || contacts.length === 0}
                    >
                        {exporting ? <RefreshCcw size={16} className="spin" /> : <Download size={16} />}
                        Exportar CSV
                    </button>

                    <button 
                        className="btn btn-secondary" 
                        style={{ height: '42px', width: '42px', padding: 0, justifyContent: 'center' }}
                        onClick={() => fetchContacts()}
                        disabled={loading}
                    >
                        <RefreshCcw size={16} className={loading ? 'spin' : ''} />
                    </button>
                </div>
            </div>

            <ImportContactsModal 
                isOpen={isImportModalOpen} 
                onClose={() => setIsImportModalOpen(false)} 
                groups={groups}
                onSuccess={(msg) => {
                    toastSucesso('Importação Concluída', msg);
                    fetchInitialData();
                    fetchContacts();
                }}
            />

            {/* Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '1rem 1.25rem', textAlign: 'center', width: '40px' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={contacts.length > 0 && contacts.every(c => selectedIds.includes(c.id))}
                                        onChange={toggleSelectAll}
                                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                    />
                                </th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Contato</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Número / ID</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Grupo de Origem</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Presença</th>
                                <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Extraído em</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.length > 0 ? contacts.map(contact => (
                                <tr key={contact.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s', opacity: contact.no_grupo ? 1 : 0.6 }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedIds.includes(contact.id)}
                                            onChange={() => toggleSelect(contact.id)}
                                            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                        />
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: contact.no_grupo ? 'rgba(var(--primary-rgb), 0.1)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: contact.no_grupo ? 'var(--primary)' : 'var(--text-dim)' }}>
                                                <UserCircle size={18} />
                                            </div>
                                            <div style={{ fontWeight: 600, color: '#fff' }}>{contact.nome || 'Sem Nome'}</div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>{contact.numero}</div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 500, fontSize: '0.85rem', color: '#fff' }}>{contact.nome_grupo}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{contact.jid_grupo}</div>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <div style={{ 
                                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                                            padding: '4px 10px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 700,
                                            background: contact.no_grupo ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            color: contact.no_grupo ? '#34d399' : '#f87171',
                                            textTransform: 'uppercase'
                                        }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: contact.no_grupo ? '#10b981' : '#ef4444' }}></div>
                                            {contact.no_grupo ? 'No Grupo' : 'Saiu'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 500 }}>{new Date(contact.extraido_em).toLocaleDateString('pt-BR')}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{new Date(contact.extraido_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                        <button onClick={() => handleDeleteSingle(contact)} className="btn-icon-danger" title="Excluir contato">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                                        {loading ? <RefreshCcw size={32} className="spin" style={{ margin: '0 auto' }} /> : 'Nenhum contato encontrado.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                        Mostrando <strong style={{ color: '#fff' }}>{contacts.length}</strong> de <strong style={{ color: '#fff' }}>{totalContacts}</strong> leads
                    </div>
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <button className="btn btn-secondary" style={{ height: '32px', fontSize: '0.8rem' }} disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Anterior</button>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Página <strong style={{ color: '#fff' }}>{currentPage}</strong> de {totalPages}</span>
                            <button className="btn btn-secondary" style={{ height: '32px', fontSize: '0.8rem' }} disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Próxima</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Toast Feedback */}
            {toast.show && (
                <div className="fade-in" style={{
                    position: 'fixed', bottom: '30px', right: '30px', zIndex: 10000,
                    padding: '1rem 1.5rem', borderRadius: '12px',
                    background: toast.type === 'error' ? 'var(--danger)' : 'var(--success)',
                    color: '#fff', display: 'flex', alignItems: 'center', gap: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                    fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    {toast.type === 'error' ? <XCircle size={20} /> : <CheckCircle2 size={20} />}
                    {toast.message}
                </div>
            )}
        </div>
    );
};

export default Contacts;
