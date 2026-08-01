---
trigger: always_on
---

# Regra de Uso da API do WhatsApp (W-API)

Este projeto utiliza exclusivamente a **W-API** para todas as integrações com o WhatsApp.

**Documentação oficial:** https://docs.w-api.app/api-integration/__intro__

**Protocolo Obrigatório:**
1. **Consulta exclusiva:** Toda vez que precisar implementar uma funcionalidade envolvendo WhatsApp, consulte APENAS a documentação da W-API. Não pesquise em outras APIs (Twilio, Baileys, WPPConnect, Evolution API, etc.) a menos que o usuário explicitamente autorize.
2. **Verificar viabilidade antes de codar:** Antes de implementar, confirme que a W-API suporta a funcionalidade solicitada. Se não suportar, informe o usuário claramente e aguarde instrução.
3. **Acesso à documentação:** Use `WebFetch` para consultar a documentação diretamente quando necessário. A estrutura da doc cobre: Instâncias, Mensagens, Conversas, Contatos, Grupos, Webhooks e Filas de Mensagens.
4. **Nunca assumir compatibilidade:** Não presuma que um endpoint existe sem verificar na documentação. Sempre valide antes de usar.

**Funcionalidades disponíveis na W-API (visão geral):**
- Gerenciamento de instâncias WhatsApp
- Envio e recebimento de mensagens
- Gerenciamento de contatos e grupos
- Rastreamento de conversas
- Webhooks para eventos em tempo real
- Filas de mensagens assíncronas

**Se a funcionalidade não existir na W-API:** Informe ao usuário de forma clara antes de qualquer implementação. Nunca implemente com outra API sem autorização explícita.
