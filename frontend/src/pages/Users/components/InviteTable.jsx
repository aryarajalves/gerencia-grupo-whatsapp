import React from 'react';
import { Link2, Copy, Check, Trash2, Clock, ShieldAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';

const InviteTable = ({ invites, handleDeleteInvite }) => {
    const [copiedId, setCopiedId] = React.useState(null);

    const handleCopy = (link, id) => {
        navigator.clipboard.writeText(link);
        setCopiedId(id);
        toast.success("Link de convite copiado!");
        setTimeout(() => setCopiedId(null), 2000);
    };

    const getStatusBadge = (invite) => {
        if (invite.usado) {
            return (
                <span style={{
                    padding: '4px 12px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700,
                    background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)'
                }}>
                    USADO
                </span>
            );
        }

        if (invite.expira_em && new Date(invite.expira_em) < new Date()) {
            return (
                <span style={{
                    padding: '4px 12px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700,
                    background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)'
                }}>
                    EXPIRADO
                </span>
            );
        }

        return (
            <span style={{
                padding: '4px 12px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700,
                background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)'
            }}>
                ATIVO
            </span>
        );
    };

    const formatDate = (isoStr) => {
        if (!isoStr) return 'Sem expiração';
        const d = new Date(isoStr);
        return d.toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div style={{ 
            background: 'rgba(23, 25, 33, 0.4)', 
            borderRadius: '24px', 
            border: '1px solid rgba(255,255,255,0.05)',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
        }}>
            <div style={{ 
                display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.5fr 1.5fr 1fr 1fr', 
                padding: '1.5rem 2rem', background: 'rgba(255,255,255,0.02)',
                fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)',
                textTransform: 'uppercase', letterSpacing: '0.1em',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div>Cargo do Convidado</div>
                <div>Tipo</div>
                <div>Criado em</div>
                <div>Validade / Expiração</div>
                <div style={{ textAlign: 'center' }}>Status</div>
                <div style={{ textAlign: 'right' }}>Ações</div>
            </div>

            <div style={{ maxHeight: 'calc(100vh - 450px)', overflowY: 'auto', overflowX: 'hidden' }}>
                {invites.length === 0 ? (
                    <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                        <div style={{ marginBottom: '1rem', opacity: 0.2 }}><Link2 size={64} style={{ margin: '0 auto' }} /></div>
                        Nenhum link de convite gerado.
                    </div>
                ) : (
                    invites.map((invite) => {
                        const isExpired = invite.expira_em && new Date(invite.expira_em) < new Date();
                        const isInactive = invite.usado || isExpired;

                        return (
                            <div key={invite.id} className="user-row-premium" style={{ 
                                display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.5fr 1.5fr 1fr 1fr', 
                                padding: '1.25rem 2rem', alignItems: 'center',
                                transition: 'all 0.2s', borderBottom: '1px solid rgba(255,255,255,0.02)',
                                opacity: isInactive ? 0.6 : 1
                            }}>
                                <div>
                                    <span style={{ 
                                        padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700,
                                        background: invite.cargo === 'SUPER_ADMIN' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                                        color: invite.cargo === 'SUPER_ADMIN' ? '#fbbf24' : '#60a5fa',
                                        border: invite.cargo === 'SUPER_ADMIN' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(59, 130, 246, 0.3)'
                                    }}>
                                        {invite.cargo}
                                    </span>
                                </div>

                                <div style={{ fontSize: '0.85rem', color: '#fff', textTransform: 'capitalize' }}>
                                    {invite.tipo === 'reset' ? 'Recuperação' : 'Novo Usuário'}
                                </div>

                                <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                                    {formatDate(invite.criado_em)}
                                </div>

                                <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Clock size={14} /> {formatDate(invite.expira_em)}
                                </div>

                                <div style={{ textAlign: 'center' }}>
                                    {getStatusBadge(invite)}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                    {!invite.usado && (
                                        <button 
                                            onClick={() => handleCopy(invite.link, invite.id)}
                                            className="btn-icon" 
                                            title="Copiar Link de Convite"
                                            style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', borderRadius: '8px', padding: '6px' }}
                                        >
                                            {copiedId === invite.id ? <Check size={16} style={{ color: '#4ade80' }} /> : <Copy size={16} />}
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => handleDeleteInvite(invite.id)}
                                        className="btn-icon" 
                                        title="Excluir Convite"
                                        style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderRadius: '8px', padding: '6px' }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default InviteTable;
