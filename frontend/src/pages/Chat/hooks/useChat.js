import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import axiosInstance from '../../../services/api';
import { toast } from 'react-hot-toast';
import { toastPlanoInsuficiente } from '../../../utils/toastPlano.jsx';

export const useChat = (openConfirm) => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [groupSearch, setGroupSearch] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [waStatus, setWaStatus] = useState({ status: 'desconhecido', plan_type: 'LITE' });
  const [isMaximized, setIsMaximized] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  const isAtBottomRef = useRef(true);
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchGroups();
    fetchWaStatus();
    const statusInterval = setInterval(fetchWaStatus, 60000);
    return () => clearInterval(statusInterval);
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      setMessages([]); // Clear previous messages to avoid flickering
      fetchMessages(selectedGroup.id_do_grupo);
      const interval = setInterval(() => fetchMessages(selectedGroup.id_do_grupo, false), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedGroup]);

  useLayoutEffect(() => {
    if (scrollRef.current && isAtBottomRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchWaStatus = async () => {
    try {
      const res = await axiosInstance.get('/whatsapp/status');
      setWaStatus(res.data);
    } catch (error) {
      console.error('Erro ao buscar status do WhatsApp');
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await axiosInstance.get('/captura/conversas/');
      setGroups(Array.isArray(res.data) ? res.data : (res.data?.items || []));
    } catch (error) {
      try {
        const resFallback = await axiosInstance.get('/grupos/');
        setGroups(Array.isArray(resFallback.data) ? resFallback.data : (resFallback.data?.items || []));
      } catch (err) {
        console.error('Erro ao carregar conversas no chat:', err);
        setGroups([]);
      }
    }
  };

  const fetchMessages = async (groupJid, showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await axiosInstance.get('/captura/mensagens/', {
        params: { group_jid: groupJid, limit: 100 }
      });
      const rawItems = res.data?.items || (Array.isArray(res.data) ? res.data : []);
      const sortedMsgs = [...rawItems].reverse();
      setMessages(sortedMsgs);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      setMessages([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if ((!messageInput.trim() && !selectedFile) || !selectedGroup || sending) return;

    setSending(true);
    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('group_jid', selectedGroup.id_do_grupo);
        if (messageInput.trim()) {
          formData.append('caption', messageInput);
        }
        await axiosInstance.post('/captura/enviar-midia', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axiosInstance.post('/captura/enviar', {
          group_jid: selectedGroup.id_do_grupo,
          message: messageInput
        });
      }
      
      setMessageInput('');
      setSelectedFile(null);
      setFilePreview(null);
      setIsMaximized(false);
      
      toast.success('Mensagem enviada');
      
      setTimeout(() => {
        fetchMessages(selectedGroup.id_do_grupo, false);
      }, 800);
    } catch (error) {
      toast.error('Falha ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const atBottom = scrollHeight - scrollTop - clientHeight < 20;
      isAtBottomRef.current = atBottom;
      setShowScrollButton(!atBottom);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
      isAtBottomRef.current = true;
      setShowScrollButton(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setFilePreview({ type: 'image', url: reader.result });
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        setFilePreview({ type: 'video', name: file.name });
      } else if (file.type.startsWith('audio/')) {
        const url = URL.createObjectURL(file);
        setFilePreview({ type: 'audio', name: file.name, url });
      } else {
        setFilePreview({ type: 'file', name: file.name });
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], `recording_${Date.now()}.webm`, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setSelectedFile(file);
        setFilePreview({ type: 'audio', name: 'Áudio Gravado', url });
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      toast.error('Erro ao acessar microfone');
      console.error(error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
    }
  };

  const handleDeleteMessage = (msg) => {
    openConfirm({
      title: 'Apagar Mensagem?',
      message: 'Esta ação apagará a mensagem para todos no WhatsApp. Esta ação não pode ser desfeita.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await axiosInstance.post(`/captura/revogar/${msg.id}`);
          toast.success('Mensagem apagada com sucesso');
          setMessages(prev => prev.filter(m => m.id !== msg.id));
        } catch (error) {
          const detail = error.response?.data?.detail || '';
          if (error.response?.status === 403 && detail.startsWith('PRO_REQUIRED::')) {
            toastPlanoInsuficiente(detail.replace('PRO_REQUIRED::', ''));
          } else {
            toast.error(detail || 'Erro ao apagar mensagem (Pode ter expirado o tempo limite)');
          }
        }
      }
    });
  };

  const filteredGroups = groups.filter(g => 
    g.nome.toLowerCase().includes(groupSearch.toLowerCase()) ||
    g.id_do_grupo.includes(groupSearch)
  );

  return {
    groups,
    selectedGroup,
    setSelectedGroup,
    messages,
    loading,
    sending,
    groupSearch,
    setGroupSearch,
    messageInput,
    setMessageInput,
    waStatus,
    isMaximized,
    setIsMaximized,
    selectedFile,
    setSelectedFile,
    filePreview,
    setFilePreview,
    isRecording,
    recordingTime,
    showScrollButton,
    scrollRef,
    fileInputRef,
    filteredGroups,
    handleSendMessage,
    handleScroll,
    scrollToBottom,
    handleFileSelect,
    startRecording,
    stopRecording,
    handleDeleteMessage,
    fetchMessages
  };
};
