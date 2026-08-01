import React, { useState } from 'react';
import { Upload, X, FileText, CheckCircle2, AlertCircle, RefreshCcw } from 'lucide-react';
import axiosInstance from '../../../services/api';

const ImportContactsModal = ({ isOpen, onClose, onSuccess, groups = [] }) => {
    const [file, setFile] = useState(null);
    const [selectedGroupJid, setSelectedGroupJid] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            if (!selected.name.toLowerCase().endsWith('.csv') && !selected.name.toLowerCase().endsWith('.txt')) {
                setErrorMsg('Apenas arquivos .csv ou .txt são suportados.');
                setFile(null);
                return;
            }
            setErrorMsg('');
            setFile(selected);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const dropped = e.dataTransfer.files[0];
        if (dropped) {
            if (!dropped.name.toLowerCase().endsWith('.csv') && !dropped.name.toLowerCase().endsWith('.txt')) {
                setErrorMsg('Apenas arquivos .csv ou .txt são suportados.');
                setFile(null);
                return;
            }
            setErrorMsg('');
            setFile(dropped);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setErrorMsg('Por favor, selecione um arquivo CSV para importar.');
            return;
        }

        setLoading(true);
        setErrorMsg('');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const selectedGroupObj = groups.find(g => g.jid_grupo === selectedGroupJid);
            const params = {};
            if (selectedGroupJid) params.jid_grupo = selectedGroupJid;
            if (selectedGroupObj?.nome_grupo) params.nome_grupo = selectedGroupObj.nome_grupo;

            const res = await axiosInstance.post('/contatos/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                params
            });

            setLoading(false);
            if (typeof onSuccess === 'function') {
                onSuccess(res.data.message || `${res.data.imported_count} contatos importados com sucesso!`);
            }
            onClose();
        } catch (err) {
            setLoading(false);
            const detail = err.response?.data?.detail || 'Erro ao processar o arquivo de contatos.';
            setErrorMsg(detail);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div 
                className="card modal-content modal-container" 
                style={{ width: '100%', maxWidth: '520px', padding: '1.75rem', position: 'relative' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            background: 'rgba(var(--primary-rgb), 0.15)',
                            border: '1px solid rgba(var(--primary-rgb), 0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Upload size={18} style={{ color: 'var(--primary)' }} />
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Importar Contatos (CSV)</h2>
                    </div>
                    <button 
                        onClick={onClose} 
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}
                        disabled={loading}
                    >
                        <X size={20} />
                    </button>
                </div>

                {errorMsg && (
                    <div style={{
                        padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem',
                        background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                        <AlertCircle size={16} />
                        <span>{errorMsg}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
                            Grupo de Origem (Opcional)
                        </label>
                        <select
                            value={selectedGroupJid}
                            onChange={(e) => setSelectedGroupJid(e.target.value)}
                            style={{ width: '100%', height: '42px', padding: '0 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }}
                            disabled={loading}
                        >
                            <option value="" style={{ background: '#1c1e26' }}>Sem Grupo Específico (Definido no CSV ou Importado)</option>
                            {groups.map(g => (
                                <option key={g.jid_grupo} value={g.jid_grupo} style={{ background: '#1c1e26' }}>{g.nome_grupo}</option>
                            ))}
                        </select>
                    </div>

                    <div 
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        style={{
                            border: '2px dashed var(--border)', borderRadius: '12px', padding: '1.5rem',
                            textAlign: 'center', background: 'rgba(255,255,255,0.01)', cursor: 'pointer',
                            marginBottom: '1.25rem', transition: 'all 0.2s ease'
                        }}
                        onClick={() => document.getElementById('csvFileInput').click()}
                    >
                        <input 
                            id="csvFileInput" 
                            type="file" 
                            accept=".csv,.txt" 
                            onChange={handleFileChange} 
                            style={{ display: 'none' }} 
                        />
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px auto'
                        }}>
                            <FileText size={24} style={{ color: file ? 'var(--primary)' : 'var(--text-dim)' }} />
                        </div>
                        {file ? (
                            <div>
                                <p style={{ margin: 0, fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{file.name}</p>
                                <p style={{ margin: '4px 0 0 0', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                                    {(file.size / 1024).toFixed(1)} KB • Pronto para importar
                                </p>
                            </div>
                        ) : (
                            <div>
                                <p style={{ margin: 0, fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>Clique ou arraste o arquivo CSV aqui</p>
                                <p style={{ margin: '4px 0 0 0', color: 'var(--text-dim)', fontSize: '0.75rem' }}>Suporta arquivos .CSV ou .TXT (máx. 10MB)</p>
                            </div>
                        )}
                    </div>

                    <div style={{
                        padding: '0.85rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '1.5rem'
                    }}>
                        <strong style={{ color: '#fff' }}>Formato Recomendado do CSV:</strong>
                        <p style={{ margin: '4px 0 0 0' }}>Colunas aceitas: <code>Nome</code>, <code>Numero</code> (ou Telefone), <code>Grupo</code>.</p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button 
                            type="button" 
                            className="btn btn-secondary" 
                            onClick={onClose} 
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            disabled={loading || !file}
                            style={{ gap: '8px' }}
                        >
                            {loading ? <RefreshCcw size={16} className="spin" /> : <Upload size={16} />}
                            {loading ? 'Importando...' : 'Importar Contatos'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ImportContactsModal;
