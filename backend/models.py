import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Date, Time, Boolean, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.types import TypeDecorator, CHAR
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from database import Base

class GUID(TypeDecorator):
    """Platform-independent GUID type.
    Uses PostgreSQL's UUID type, otherwise uses CHAR(36), storing as string.
    """
    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(PG_UUID(as_uuid=True))
        else:
            return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            return str(value)
        else:
            if not isinstance(value, uuid.UUID):
                return str(uuid.UUID(value))
            else:
                return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        else:
            if not isinstance(value, uuid.UUID):
                value = uuid.UUID(value)
            return value


class GrupoWhatsApp(Base):
    __tablename__ = "grupos_whatsapp"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    cliente_id = Column(GUID(), ForeignKey("clientes.id", ondelete="CASCADE"), nullable=True, index=True)
    nome = Column(String, index=True)
    id_do_grupo = Column(String, unique=True, index=True) # WhatsApp JID
    numero_do_disparo = Column(String) # Qual número vai enviar
    ativo = Column(Boolean, default=True)

    dia_inicio_semana = Column(Integer, default=0) # 0=Segunda, 1=Terça, etc.
    dia_fim_semana = Column(Integer, default=4) # Padrão Sexta-feira
    dia_lancamento_atual = Column(Integer, default=0) # 0=Encerrado/Esperando, 1=Dia 01, etc.
    link_convite = Column(String, nullable=True) # Link para acessar o grupo
    quantidade_contatos = Column(Integer, default=0)
    tipo_ciclo = Column(String, default="semanal")  # "semanal" ou "unico"
    extrair_contatos = Column(Boolean, default=True)
    intervalo_extracao_minutos = Column(Integer, default=30)
    ultima_extracao_em = Column(DateTime, nullable=True)
    webhook_extracao_url = Column(String, nullable=True)  # URL para envio de novos contatos extraídos
    tempo_digitando_segundos = Column(Integer, default=0)  # 0=desabilitado, 1-60=segundos de simulação "digitando"



class MensagemDisparada(Base):
    __tablename__ = "mensagens_disparadas"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    cliente_id = Column(GUID(), ForeignKey("clientes.id", ondelete="CASCADE"), nullable=True, index=True)
    mensagem = Column(Text)
    numero_da_mensagem = Column(Integer)
    dia_do_lancamento = Column(Integer) # Ex: 1, 2, 3...
    horario_do_disparo = Column(Time)
    tipo_de_mensagem = Column(String)  # texto, imagem, video, arquivo, audio, enquete
    link_midia = Column(String, nullable=True) # URL do S3/Upload
    opcoes_enquete = Column(Text, nullable=True) # Opções separadas por vírgula ou JSON
    enquete_multipla = Column(Boolean, default=False)
    status = Column(String, default="pendente")
    ativo = Column(Boolean, default=True)

    grupos = relationship("GrupoWhatsApp", secondary="grupo_mensagens", backref="mensagens_associadas")

class GrupoMensagem(Base):
    """
    Associação entre grupos e mensagens.
    Se um grupo possui entradas aqui, o scheduler só dispara as mensagens associadas.
    Se não possui nenhuma, recebe todas (comportamento padrão/legado).
    """
    __tablename__ = "grupo_mensagens"

    grupo_id = Column(GUID(), ForeignKey("grupos_whatsapp.id", ondelete="CASCADE"), primary_key=True)
    mensagem_id = Column(GUID(), ForeignKey("mensagens_disparadas.id", ondelete="CASCADE"), primary_key=True)


class LogDisparo(Base):
    __tablename__ = "logs_disparos"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    cliente_id = Column(GUID(), ForeignKey("clientes.id", ondelete="CASCADE"), nullable=True, index=True)
    grupo_nome = Column(String)
    mensagem_corpo = Column(Text)
    status = Column(String) # Sucesso, Erro, FALHA_DEFINITIVA
    detalhes_erro = Column(Text, nullable=True)
    mensagem_id = Column(GUID(), nullable=True)
    tipo = Column(String, nullable=True) # texto, imagem, nome_grupo, etc.
    criado_em = Column(DateTime, default=datetime.now)
    dispensado = Column(Boolean, default=False)

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    nome = Column(String)
    email = Column(String, unique=True, index=True)
    cargo = Column(String) # SUPER_ADMIN, ADMIN
    ativo = Column(Boolean, default=True)
    senha_hash = Column(String, nullable=True) # Para futura autenticação real
    criado_em = Column(DateTime, default=datetime.now)

class Configuracao(Base):
    __tablename__ = "configuracoes"
    chave = Column(String, primary_key=True)
    valor = Column(Text)

def get_br_time():
    import pytz
    return datetime.now(pytz.timezone('America/Sao_Paulo')).replace(tzinfo=None)

class Cliente(Base):
    __tablename__ = "clientes"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    nome = Column(String, index=True)
    subtitulo = Column(String, default="CONTROL PANEL")
    logo_url = Column(String, nullable=True)
    logo_size = Column(Integer, default=44)
    wapi_instance_id = Column(String, nullable=True)
    wapi_token = Column(String, nullable=True)
    wapi_plan_type = Column(String, default="PRO")
    ativo = Column(Boolean, default=True)
    criado_em = Column(DateTime, default=get_br_time)

class MensagemCapturada(Base):
    __tablename__ = "mensagens_capturadas"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    cliente_id = Column(GUID(), ForeignKey("clientes.id", ondelete="CASCADE"), nullable=True, index=True)
    message_id = Column(String, nullable=True, index=True) # ID real do WhatsApp
    from_me = Column(Boolean, default=False) # Se a mensagem foi enviada pelo bot
    sender_name = Column(String)
    sender_number = Column(String)
    message_content = Column(Text)
    media_url = Column(String, nullable=True)
    media_type = Column(String, nullable=True) # imagem, video, audio, arquivo
    group_jid = Column(String)
    group_name = Column(String, nullable=True)
    timestamp = Column(DateTime, default=get_br_time)

class ContatoGrupo(Base):
    __tablename__ = "contatos_grupos"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    cliente_id = Column(GUID(), ForeignKey("clientes.id", ondelete="CASCADE"), nullable=True, index=True)
    nome = Column(String, nullable=True)
    numero = Column(String) # WhatsApp ID ou Número
    jid_grupo = Column(String)
    nome_grupo = Column(String)
    no_grupo = Column(Boolean, default=True)
    extraido_em = Column(DateTime, default=get_br_time)
    webhook_enviado = Column(Boolean, default=False)
    webhook_enviado_em = Column(DateTime, nullable=True)


class ConjuntoGrupo(Base):
    __tablename__ = "conjuntos_grupos"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    cliente_id = Column(GUID(), ForeignKey("clientes.id", ondelete="CASCADE"), nullable=True, index=True)
    nome = Column(String, index=True)
    slug = Column(String, unique=True, index=True) # Para o link universal
    ativo = Column(Boolean, default=True)
    social_links = Column(Text, nullable=True) # JSON com as redes sociais configuradas
    criado_em = Column(DateTime, default=datetime.now)


class GrupoConjuntoAssociacao(Base):
    __tablename__ = "grupo_conjunto_associacoes"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    conjunto_id = Column(GUID(), ForeignKey("conjuntos_grupos.id", ondelete="CASCADE"))
    grupo_id = Column(GUID(), ForeignKey("grupos_whatsapp.id", ondelete="CASCADE"))
    posicao = Column(Integer) # Ordem de redirecionamento
    max_leads = Column(Integer, default=900) # Limite para mudar para o próximo grupo

class Invitation(Base):
    __tablename__ = "invitations"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    token = Column(String, unique=True, index=True)
    cargo = Column(String) # SUPER_ADMIN, ADMIN
    tipo = Column(String, default="convite") # convite, reset
    usuario_id = Column(GUID(), ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=True) # Para links de reset
    usado = Column(Boolean, default=False)
    expira_em = Column(DateTime, nullable=True) # NULL = Ilimitado
    criado_em = Column(DateTime, default=get_br_time)

