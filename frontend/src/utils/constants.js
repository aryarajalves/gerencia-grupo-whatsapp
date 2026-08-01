import { MessageSquare, Edit3, Image, Video, Mic, FileText, LayoutGrid, Lock } from 'lucide-react';

export const TIPO_CONFIG = {
  texto:        { label: 'Texto',        icon: MessageSquare, color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.25)' },
  nome_grupo:   { label: 'Nome Grupo',  icon: Edit3,        color: '#f97316', bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.25)' },
  status_grupo: { label: 'Abrir/Fechar', icon: Lock,         color: '#ec4899', bg: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.25)' },
  imagem:       { label: 'Imagem',       icon: Image,         color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.25)' },
  video:        { label: 'Vídeo',        icon: Video,         color: '#f472b6', bg: 'rgba(244,114,182,0.12)', border: 'rgba(244,114,182,0.25)' },
  audio:        { label: 'Áudio',        icon: Mic,           color: '#34d399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.25)' },
  arquivo:      { label: 'PDF/Arquivo',  icon: FileText,      color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.25)' },
  enquete:      { label: 'Enquete',      icon: LayoutGrid,    color: '#22d3ee', bg: 'rgba(34,211,238,0.12)',  border: 'rgba(34,211,238,0.25)' }
};


export const DIAS_SEMANA = [
  "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"
];
