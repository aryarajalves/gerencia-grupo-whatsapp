import React, { useEffect, useState } from 'react';
import { 
  Users, AlertCircle, MessageSquare, Instagram, Facebook, 
  Twitter, Globe, Youtube, MessageCircle, Send, Music2
} from 'lucide-react';
import axiosInstance from '../services/api';

const ICON_MAP = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  youtube: Youtube,
  tiktok: Music2,
  website: Globe,
  whatsapp: MessageCircle,
  telegram: Send
};

const FullSet = () => {
  const [info, setInfo] = useState(null);
  const [links, setLinks] = useState([]);
  
  const searchParams = new URLSearchParams(window.location.search);
  const slug = searchParams.get('slug');

  useEffect(() => {
    if (slug) {
      axiosInstance.get(`/info/${slug}`)
        .then(res => {
          setInfo(res.data);
          if (res.data.social_links) {
            setLinks(JSON.parse(res.data.social_links));
          }
        })
        .catch(err => console.error("Erro ao buscar info do conjunto:", err));
    }
  }, [slug]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0a0a0f', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '20px',
      fontFamily: "'Inter', sans-serif",
      color: '#fff'
    }}>
      <div style={{ 
        maxWidth: '480px', 
        width: '100%', 
        background: 'rgba(255, 255, 255, 0.03)', 
        backdropFilter: 'blur(20px)', 
        border: '1px solid rgba(255, 255, 255, 0.1)', 
        borderRadius: '24px', 
        padding: '40px 30px', 
        textAlign: 'center',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
      }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          borderRadius: '24px', 
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(239, 68, 68, 0.2))', 
          border: '1px solid rgba(245, 158, 11, 0.3)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 24px' 
        }}>
          <Users size={40} style={{ color: '#f59e0b' }} />
        </div>

        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px', background: 'linear-gradient(to right, #fff, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Grupos Lotados!
        </h1>
        
        <p style={{ color: '#a1a1aa', fontSize: '1rem', lineHeight: '1.6', marginBottom: '32px' }}>
          Ops! No momento todos os grupos de <strong>{info?.nome || 'nossa comunidade'}</strong> atingiram a capacidade máxima. 
          Estamos trabalhando para liberar novas vagas em breve.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ 
            padding: '16px', 
            borderRadius: '16px', 
            background: 'rgba(255, 255, 255, 0.03)', 
            border: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textAlign: 'left'
          }}>
            <AlertCircle size={20} style={{ color: '#f59e0b', flexShrink: 0 }} />
            <span style={{ fontSize: '0.9rem', color: '#d1d5db' }}>Fique atento às nossas notificações para não perder a próxima abertura.</span>
          </div>
        </div>

        {links.length > 0 && (
          <div style={{ marginTop: '40px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '32px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '20px' }}>
            {links.map((link, idx) => {
              const Icon = ICON_MAP[link.icon] || Globe;
              return (
                <a 
                  key={idx}
                  href={link.url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'rgba(255,255,255,0.4)', transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                  onMouseOver={e => {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.transform = 'scale(1.2)';
                  }} 
                  onMouseOut={e => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <Icon size={28} />
                </a>
              );
            })}
          </div>
        )}
        
        <div style={{ marginTop: '24px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)' }}>
          Powered by ZapGroup
        </div>
      </div>
    </div>
  );
};

export default FullSet;
