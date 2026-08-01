from pydantic import BaseModel
import uuid
from datetime import date, time, datetime
from typing import Optional, List

class ClienteBase(BaseModel):
    nome: str
    subtitulo: Optional[str] = "CONTROL PANEL"
    logo_url: Optional[str] = None
    logo_size: Optional[int] = 44
    wapi_instance_id: Optional[str] = None
    wapi_token: Optional[str] = None
    wapi_plan_type: Optional[str] = "PRO"
    ativo: Optional[bool] = True

class ClienteCreate(ClienteBase):
    pass

class ClienteResponse(ClienteBase):
    id: uuid.UUID
    criado_em: Optional[datetime] = None

    class Config:
        from_attributes = True

class GrupoWhatsAppBase(BaseModel):
    nome: str
    id_do_grupo: str
    numero_do_disparo: str = ""
    ativo: bool = True

    dia_inicio_semana: int = 0 # 0-6
    dia_fim_semana: int = 4 # 0-6
    dia_lancamento_atual: int = 0 # 0=Encerrado
    quantidade_contatos: int = 0
    link_convite: Optional[str] = None
    tipo_ciclo: str = "semanal"  # "semanal" ou "unico"
    extrair_contatos: bool = True
    intervalo_extracao_minutos: int = 30
    ultima_extracao_em: Optional[datetime] = None
    webhook_extracao_url: Optional[str] = None  # URL para receber novos contatos extraídos via POST

class GrupoWhatsAppCreate(GrupoWhatsAppBase):
    pass

class GrupoBulkDelete(BaseModel):
    grupo_ids: List[uuid.UUID]

class GrupoWhatsApp(GrupoWhatsAppBase):

    id: uuid.UUID
    total_mensagens: int = 0
    tem_disparo_hoje: Optional[bool] = False
    total_disparos_hoje: Optional[int] = 0

    class Config:

        from_attributes = True

class MensagemDisparadaBase(BaseModel):
    mensagem: str
    numero_da_mensagem: Optional[int] = 0
    dia_do_lancamento: int
    horario_do_disparo: time
    tipo_de_mensagem: str
    link_midia: Optional[str] = None
    opcoes_enquete: Optional[str] = None
    enquete_multipla: Optional[bool] = False
    status: str = "pendente"
    ativo: bool = True
    grupo_ids: List[uuid.UUID] = []

class MensagemDisparadaCreate(MensagemDisparadaBase):
    pass

class MensagemDisparada(MensagemDisparadaBase):
    id: uuid.UUID

    class Config:
        from_attributes = True

class PaginatedMensagem(BaseModel):
    total: int
    items: List[MensagemDisparada]

class LogDisparo(BaseModel):
    id: uuid.UUID
    grupo_nome: str
    mensagem_corpo: str
    status: str
    detalhes_erro: Optional[str] = None
    mensagem_id: Optional[uuid.UUID] = None
    tipo: Optional[str] = "texto"
    tipo_mensagem: Optional[str] = "texto"
    criado_em: datetime
    dispensado: bool = False

    class Config:
        from_attributes = True

class FalhaDefinitiva(BaseModel):
    id: uuid.UUID
    grupo_nome: str
    mensagem_corpo: str
    detalhes_erro: Optional[str] = None
    criado_em: datetime

    class Config:
        from_attributes = True

class PaginatedLog(BaseModel):
    total: int
    total_sucesso: int
    total_erro: int
    items: List[LogDisparo]

class UsuarioBase(BaseModel):
    nome: str
    email: str
    cargo: str # SUPER_ADMIN, ADMIN
    ativo: bool = True

class UsuarioCreate(UsuarioBase):
    password: Optional[str] = None

class Usuario(UsuarioBase):
    id: uuid.UUID
    criado_em: datetime

    class Config:
        from_attributes = True

class ProximoDisparo(BaseModel):
    horario: str
    grupo: str
    mensagem: str
    tipo: str = "texto"

class GrupoNoDia(BaseModel):
    dia: int
    grupos: List[str]

class DashboardStats(BaseModel):
    total_grupos_ativos: int
    total_grupos_lancamento: int
    total_grupos_encerrados: int
    total_mensagens: int
    disparos_hoje: int
    taxa_sucesso: float
    ultimo_disparo: Optional[LogDisparo] = None
    proximos_disparos: List[ProximoDisparo]
    grupos_por_dia: List[GrupoNoDia]
    falhas_definitivas: List[FalhaDefinitiva] = []
    grupos_sem_mensagens: List[str] = []
    conjuntos_quase_cheios: List[dict] = []

class LoginRequest(BaseModel):
    email: str
    password: str

class ContatoGrupo(BaseModel):
    id: uuid.UUID
    nome: Optional[str] = None
    numero: str
    jid_grupo: str
    nome_grupo: str
    no_grupo: bool = True
    extraido_em: datetime
    webhook_enviado: bool = False
    webhook_enviado_em: Optional[datetime] = None

    class Config:
        from_attributes = True

class PaginatedContatos(BaseModel):
    total: int
    items: List[ContatoGrupo]

class GrupoFiltro(BaseModel):
    jid_grupo: str
    nome_grupo: str

    class Config:
        from_attributes = True


class GrupoConjuntoAssociacaoBase(BaseModel):
    grupo_id: uuid.UUID
    posicao: int
    max_leads: int = 900

class GrupoConjuntoAssociacao(GrupoConjuntoAssociacaoBase):
    id: uuid.UUID
    conjunto_id: uuid.UUID
    grupo_nome: Optional[str] = None # Nome auxiliar para o frontend
    quantidade_contatos: Optional[int] = 0 # Para mostrar no dashboard
    link_convite: Optional[str] = None

    class Config:
        from_attributes = True

class ConjuntoGrupoBase(BaseModel):
    nome: str
    slug: str
    ativo: bool = True
    social_links: Optional[str] = None

class ConjuntoGrupoCreate(ConjuntoGrupoBase):
    grupos: List[GrupoConjuntoAssociacaoBase] = []

class ConjuntoGrupo(ConjuntoGrupoBase):
    id: uuid.UUID
    criado_em: datetime
    grupos: List[GrupoConjuntoAssociacao] = []

    class Config:
        from_attributes = True

class MensagemCapturada(BaseModel):
    id: uuid.UUID
    message_id: Optional[str] = None
    from_me: bool = False
    sender_name: str
    sender_number: str
    message_content: Optional[str] = None
    media_url: Optional[str] = None
    media_type: Optional[str] = None
    group_jid: str
    group_name: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class PaginatedCapturas(BaseModel):
    total: int
    items: List[MensagemCapturada]

class ChatSendMessage(BaseModel):
    group_jid: str
    message: str

class InvitationBase(BaseModel):
    cargo: str # SUPER_ADMIN, ADMIN
    tipo: str = "convite" # convite, reset
    expira_horas: Optional[int] = None # 1, 4, 8, 12, 24 ou None (ilimitado)

class InvitationCreate(InvitationBase):
    usuario_id: Optional[uuid.UUID] = None # Apenas para tipo 'reset'

class Invitation(BaseModel):
    id: uuid.UUID
    token: str
    cargo: str
    tipo: str
    usado: bool
    expira_em: Optional[datetime] = None
    criado_em: datetime
    link: Optional[str] = None # URL completa para o frontend

    class Config:
        from_attributes = True

class UserRegister(BaseModel):
    token: str
    nome: str
    email: str
    password: str
    confirm_password: str

class PasswordReset(BaseModel):
    token: str
    password: str
    confirm_password: str
