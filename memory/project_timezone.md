---
name: Fuso horário obrigatório — Brasília
description: Todo timestamp (logs, frontend, scheduler) deve usar America/Sao_Paulo (UTC-3)
type: project
---

Todo uso de data e horário no projeto deve estar em **horário de Brasília (America/Sao_Paulo, UTC-3)**.

**Why:** Regra de negócio definida pelo dono do projeto. Sem essa conversão, logs e a interface exibem horários errados para o usuário final que está no Brasil.

**How to apply:**
- Backend: usar `from zoneinfo import ZoneInfo; BRASILIA = ZoneInfo("America/Sao_Paulo")` para gerar e comparar timestamps.
- Frontend: usar `toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })` ao exibir datas.
- Scheduler: todas as comparações de janela de disparo e avanço de ciclo (meia-noite) devem referenciar o horário de Brasília.
- Banco pode armazenar em UTC, mas conversão é obrigatória antes de exibir ou comparar.
